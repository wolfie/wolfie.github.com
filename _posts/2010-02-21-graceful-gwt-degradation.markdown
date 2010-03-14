---
layout: post
title: Graceful GWT Degradation
summary: A run-down of how I optimized a Vaadin component according to browser CSS3 support.
---

The ColumnText wraps long lines of text into columns, like you'd see in a newspaper. This exact feature is [specified][cssspecs] into CSS3, but since not that many browsers support it yet, you can't rely on it for all visitors. This can, however, be done with JavaScript, but the calculations are relatively slow. Therefore, it would be smart to let the browser do the work if it can, and only help with JavaScript, if the browser can't do it by itself.

[cssspecs]: http://www.w3.org/TR/css3-multicol/

After [a challenge][thread] from both Jouni and Marc, I have converted the ColumnText component into an example on this mechanic. Providing a optimized widgetset, depending on the visitor's browser. You can follow the code I've written, which this guide travels through, [on GitHub][ghproject].

[thread]: http://vaadin.com/forum/-/message_boards/message/117816#_19_message_118115
[ghproject]: http://github.com/wolfie/ColumnText

I have split this task into two: deferred binding, and conditional CSS.

## Deferred Binding

[Deferred binding][defbind] is a technique in GWT that tries to make up for lack of dynamic binding, or dynamic classloading, in GWT. Although you can do a lot with this feature, the reason for me was to be able to alter the widget's behavior, depending on who the widget is served to. 

[defbind]: http://code.google.com/webtoolkit/doc/latest/DevGuideCodingBasicsDeferred.html

### GWT XML

It all starts from the [widgetset's `.gwt.xml`][gwtxml] file:

[gwtxml]: http://github.com/wolfie/ColumnText/blob/master/src/com/github/wolfie/columntext/ColumntextWidgetset.gwt.xml

{% highlight xml %}
<replace-with class="com.github.wolfie.columntext.client.ui.VColumnTextJS">
	<when-type-is class="com.github.wolfie.columntext.client.ui.VColumnTextJS"/>
</replace-with>

<replace-with class="com.github.wolfie.columntext.client.ui.VColumnTextCSS">
	<when-type-is class="com.github.wolfie.columntext.client.ui.VColumnTextJS"/>
	<any>
		<when-property-is name="user.agent" value="gecko"/>
		<when-property-is name="user.agent" value="gecko1_8"/>
		<when-property-is name="user.agent" value="safari"/>
	</any>
</replace-with>
{% endhighlight %}

This tells GWT that whenever we want to initialize a class of type `VColumnTextJS`, there's two things that can happen: if the visitor has a browser that is identified by GWT as `gecko`, `gecko1_8` (these mean basically any modern Mozilla rendering engine) or `safari` (actually WebKit, including Chrome), instead of initializing a `VColumnTextJS`, initialize a `VColumnTextCSS` instead. For the rest of the browsers, just use `VColumnTextJS`.

Technically, GWT creates different sets of the widgetset. One containing `VColumnTextCSS`, the other containing `VColumnTextJS`. Neither contain both. By this, I make the widgetset as small as possible, performing as fast as possible, depending on the browser's capabilities.

### Not Created As New

But, it would be way too easy if this would work just like that. GWT has this curious little method called [`GWT.create()`][gwtcreate]. **Deferred binding works only when instantiating objects via this method**. Since Vaadin doesn't seem to use that to instantiate the client-side widgets, you can't have just two classes. Unfortunately you need a third, proxy, class. [`VColumnText`][vcolumntext] does this for me.

[gwtcreate]: http://google-web-toolkit.googlecode.com/svn/javadoc/2.0/com/google/gwt/core/client/GWT.html#create%28java.lang.Class%29
[vcolumntext]: http://github.com/wolfie/ColumnText/blob/master/src/com/github/wolfie/columntext/client/ui/VColumnText.java

The proxy class' function only to act as a [delegate][delegate] to the real widget. It's a [`Composite`][composite] that creates the object according to the rules in `.gwt.xml`, and initializes itself with it. The constructor is simply:

[delegate]: http://en.wikipedia.org/wiki/Delegation_pattern
[composite]: http://examples.roughian.com/index.htm#Widgets~Composite

{% highlight java %}
public VColumnText() {
  containedWidget = GWT.create(VColumnTextJS.class);
  initWidget(containedWidget);
}
{% endhighlight %}

As you see, I ask GWT to create a `VColumnTextJS` for me at this stage, and put that as the base for the `Composite`. Since we defined the deferred binding in the `.gwt.xml` earlier, and we are calling `GWT.create()` we get create either a `VColumnTextJS` or a `VColumnTextCSS`, depending on the browser asking for it.

### The One And Only Chore

Next, the proxy needs to forward the `updateFromUIDL()` call to the delegated widget. One very important note: _only_ the proxy may execute [`updateComponent()`][updatecomponent] inside `updateFromUIDL()`. The method should be:

[updatecomponent]: http://vaadin.com/api/com/vaadin/terminal/gwt/client/ApplicationConnection.html#updateComponent(com.google.gwt.user.client.ui.Widget,%20com.vaadin.terminal.gwt.client.UIDL,%20boolean)

{% highlight java %}
public void updateFromUIDL(final UIDL uidl, final ApplicationConnection client) {
  if (client.updateComponent(this, uidl, true)) {
    return;
  }
  containedWidget.updateFromUIDL(uidl, client);
}
{% endhighlight %}

The `containedWidget` (in my case, either a `VColumnTextJS` or a `VColumnTextCSS`) must _not_ do the `updateComponent()` call. This turned to be important.

### A Nicety

You might also notice the generics I used. The proxy class' signature is:

{% highlight java %}
public class VColumnText<T extends Widget & Paintable> extends Composite
    implements Paintable
{% endhighlight %}

Although this is a bit of abuse of the generics, since the class itself isn't bound to any type of `T`, it makes my code a bit cleaner. To clarify, `T` is both a `Widget` _and_ a `Paintable`. This allows me avoid ugly casting on `containedWidget`. Since both `VColumnTextCSS` and `VColumnTextJS` indeed are of type `T`, `containedWidget` is accepted as-is as an argument for `initWidget()`, `updateFromUIDL()` and `updateWidget()`.

Perhaps a less hack-y way would be to create an abstract class, extending `Composite` and implementing `Paintable`, but this way I spared me with yet another class. Read on, and you'll se why I have classes aplenty as it is.

## Conditional CSS

Now that I have two different widgets doing the same thing, just in different ways, I wanted them to have different CSS too. This way, I'm once again able to send the minimal amount of CSS needed over the wire.

After I read a long time the confusing documentation about [conditional CSS][condcss], I realized that this wasn't your average CSS file, but a whole new concept called [CssResource][cssresource], and you just didn't simply include it somewhere. No, there's classes, a twisted kind of dependency injection and CSS compiling involved.

[condcss]: http://code.google.com/p/google-web-toolkit/wiki/CssResource#Conditional_CSS
[cssresource]: http://code.google.com/p/google-web-toolkit/wiki/CssResource

The idea behind conditional CSS, or actually CssResource, is that it is minimized and obfuscated by GWT, just like the JavaScript is minimized and obfuscated. Since you can do stuff not supported by the CSS standards, they can't be served as-is, leading to that you can't just include the file you wrote. It's compiled and embedded into the widgetset, and active automatically.

### Step Zero: GWT XML

Before you do anything, you need to write something into your `.gwt.xml` to get the conditional CSS working:

{% highlight xml %}
<inherits name="com.google.gwt.resources.Resources" />
{% endhighlight %}

Don't know exactly what that's good for. The documentation said so.

### Step One: Interface

So, I'll try to explain how this all goes.

You start with a CSS file that is written with a superset of the standard CSS. In my instance, I used conditionals to render different CSS rules for different browsers. This is then put somewhere in your project. To start using this file, you need to create a `CssResource` interface. I called mine [CSS][icss]. The main use for me for this class was to be able to refer to the obfuscated class names. 

[icss]: http://github.com/wolfie/ColumnText/blob/master/src/com/github/wolfie/columntext/client/ui/CSS.java

So, for example, I have a `.v-columntext` CSS class defined in the original file. To be able to give those CSS rules to a Widget with [`setStyleName()`][setstylename], I defined a method in the interface:

[setstylename]: http://google-web-toolkit.googlecode.com/svn/javadoc/2.0/com/google/gwt/user/client/ui/UIObject.html#setStyleName%28java.lang.String%29

{% highlight java %}
@ClassName("v-columntext")
String className();
{% endhighlight %}

So, the method `CSS.className()` would return the obfuscated class name that originally was `v-columntext`. Alas, since the `CssResource` is just an interface, it won't suffice. 

### Step Two: Interface

We need a [ClientBundle][clientbundle]. It is kind of a mashed-up bundle that GWT has made into a big blob of stuff. It's not meant to be tampered with after it's packaged, since it's integrated with your widgetset. A ClientBundle can contain a lot of things, but it served me just one purpose: Provide me with my CssResource.

[clientbundle]: http://code.google.com/p/google-web-toolkit/wiki/ClientBundle

For this, we create once more an interface. For me, it's the [ColumnTextResources][columntextresources] interface. It has only one method, and it returns an instance of `CSS`.

[columntextresources]: http://github.com/wolfie/ColumnText/blob/master/src/com/github/wolfie/columntext/client/ui/ColumnTextResources.java

### Step Three: Create Magic

Since the `ColumnTextResources` is also just an interface, we can't call it directly, either. So, inside the interface is a bit of magic:

{% highlight java %}
public static final ColumnTextResources INSTANCE = 
  GWT.create(ColumnTextResources.class);
{% endhighlight %}

This makes GWT magically create an object out of an interface. _"Why didn't you just create a magic instance of `CSS`?"_ I hear you asking. And the answer is: GWT is a sneaky little bastard. Even if the JavaDoc of the `create()` method clearly forbids its use on interfaces, it bends the rules here, and just does that. So, it works on a `ClientBundle`, not on a `CssResource`. It must be because the location of the original CSS file is defined inside `ClientBundle`, not in `CssResource`.

Don't ask me why, but we need all these magic interfaces, and there's no way around it.

### Step Four: Use Magic

By this time, you have all your CSS included into the widgetset. Now you just need to give your widgets the proper CSS class names. After all these interfaces have been made, I can now do this:

{% highlight java %}
private static final CSS css = ColumnTextResources.INSTANCE.css();

public VColumnTextJS() {
  initWidget(panel);
  panel.setStyleName(css.className());
}
{% endhighlight %}

The instance of `CSS` is retrieved from the `ColumnTextResources`'s magic instance, called `INSTANCE`. From the `CSS`, we can get, as if by magic, the obfuscated class name for the widget itself.

### Step Oh-I-Almost-Forgot: Make Sure Magic Is Switched On

You need to make sure that all the magics are done. To do this, you need to call [`ensureInjected()`][ensureinjected] on any and all `CssResources`. GWT's [documentation suggests][injector] that this needs to be done in a GWT module's `onModuleLoad()` method. Unfortunately for us, in vaadin, that is located [in `DefaultWidgetSet`][vonmoduleload]. We don't want to mess with this, since Vaadin 6.2 was all about this. Fortunately, though, it seems to be enough to call that method in the static block of a class that needs the CssResource.

[ensureinjected]: http://google-web-toolkit.googlecode.com/svn/javadoc/2.0/com/google/gwt/resources/client/CssResource.html#ensureInjected%28%29
[injector]: http://code.google.com/p/google-web-toolkit/wiki/StyleInjector#Details
[vonmoduleload]: http://vaadin.com/api/com/vaadin/terminal/gwt/client/DefaultWidgetSet.html#onModuleLoad()

So, in both of my widget implementations, I have:

{% highlight java %}
private static final CSS css = ColumnTextResources.INSTANCE.css();

static {
  css.ensureInjected();
}
{% endhighlight %}

### Caveats

All this compilation and obfuscation means that you can't use this if you mean to let end-users override your CSS. This is a huge bummer, considering the way themeing is supported with Vaadin.

If you are going to use the `-moz` and `-webkit` special CSS rules, note that [GWT doesn't like them][dashcss] very much, for some strange reason. You must write `\-moz` or `\-webkit` instead. Otherwise, the CSS compilation will fail, and they will not be included into the widgetset.

[dashcss]: http://code.google.com/p/google-web-toolkit/issues/detail?id=3595 

Also looking at the cumbersomeness of the magic interfaces and somewhat awkward of referencing to the various class names, I'd say this doesn't pay much off in simple widgets. I can see the benefits in some special cases, where you know you don't want to allow the user to touch some CSS-settings in your widget. These cases are very rare, though. 

My recommendation is to stick with plain ol' CSS files, inheriting them in the `.gwt.xml` file.

## In Conclusion

To provide two different versions of the same widget and CSS, I now have five class/interface files and a fair amount of markup in the `.gwt.xml`, instead of just one class and one default line in the `.gwt.xml`, had I catered just one version for everyone.

The proxy class could be gotten rid of if Vaadin would always create the client-side widgets with the `GWT.create()` method. Also, the conditional css accounted for two of the interfaces and a lot of code-oddity, which to me doesn't sound like a good trade-off.

All this makes me think that individual widget-makers aren't really the focus group of these features. I'd say that Vaadin would have considerable performance gains in splitting their widgets this way. 

But don't touch the ClientBundle unless you know what you're doing. While it might feel less magic once you get to know it, nobody will be able to theme your component, if you do it this way. But if do want to use it, now you have a better start at it than I had.

If you want to give the component a try, it's up at [http://henrik.virtuallypreinstalled.com/ColumnText](http://henrik.virtuallypreinstalled.com/ColumnText). There's also a thread about the component on [Vaadin's forums](http://vaadin.com/forum/-/message_boards/message/117816). You're welcome to comment the article itself below. 
