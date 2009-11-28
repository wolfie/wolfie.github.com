---
layout: post
title: Treading New Ground
summary: In this article, I explain the steps I took and difficulties with their respective solutions to a Vaadin component I wrote from scratch.
---

Have you ever been in the situation where your toolbox is littered with stuff, but you're missing an exact wrench for the 17mm nut? Sure, you could manage with a pair of water pump pliers or that adjustable wrench you got last week. But, occasionally the nut would remain seen, and you really would not want to nick it, making it look ugly.

Drawing wireframes for a project of mine, I noticed that I needed a widget that wasn't available in [Vaadin's][vaadin] default set of widgets. There were things that were close, but not exactly that. I didn't want to nick the UI this time. I needed to build [The Drawer][drawer].

[drawer]: http://henrik.virtuallypreinstalled.com/Drawer
[vaadin]: http://vaadin.com/

The aim of the drawer is to hide unnecessary UI complexity, where it cannot be completely removed. The widget consists of a heading and a body. The body can be toggled visible by clicking the heading. This will be presented with some sweet, smooth, animation action. Like a real drawer, really.

Since this was my first honest-to-god from-ground-up Vaadin Component, I decided to make note of any and all encountered potholes and do my best to let others avoid them. Most of them I found on the GWT side of things. But this could be because I'm so used to the Vaadin's server-side API.

## Animate Dead

I started this the same way I would start any new coding adventure: With a blank canvas. Having the Eclipse [Vaadin plugin][plugin] installed, I created a blank Widget<sup>1)</sup> and opened the source for a simple and (what I estimated to be) similar widget alongside so that I could get started and hints on what to do in which method.

[plugin]: http://vaadin.com/eclipse

<span style="font-size: 80%;"><sup>1)</sup> The terms _Component_ and _Widget_ are closely related with Vaadin, and equally easy to mix up. A Component is the server-side object. A Widget is the client-side object. Unfortunately, the word "Component" is also used when talking about the combination of those two, and this is [also mentioned][component-quote] by the Book of Vaadin. Confusingly, though, the plugin uses the term "Vaadin Widget" when creating a new pair.</span>

[component-quote]: http://vaadin.com/book/-/page/gwt.html

Since I wanted to get the hard part (or, what I _thought_ to be the hard part) off the table, I wanted to get the animation done first. Only after this, I would start worrying about getting content into that drawer box. After skimming through some chapters in GWT manuals, I dove head-first into the client-side widget &ndash; into GWT land.

Not before long, I had two [SimplePanel][roughian-simplepanel]s in a [VerticalPanel][roughian-verticalpanel]. Whoo! After a quick look at the [Animation][gwt-animation] abstract class, I noticed how simple it would be to get animations. You simply extend the class, implement the `onUpdate()` method and make the necessary changes in it. Then you simply call `new MyAnimation().run()` and you're flying. After I rigged this animation in a [ClickHandler][gwt-clickhandler] and put it into the heading, I had a widget growing and shrinking between 0 and 300 pixels in no time. Since I had successfully both configured OOPHM _and_ got an animated client-side widget done in a single working day's time, How Hard Could This Be&trade;? _Cue ominous dark clouds and sounds of thunder in the distance_.

[roughian-simplepanel]: http://examples.roughian.com/index.htm#Panels~SimplePanel
[roughian-verticalpanel]: http://examples.roughian.com/index.htm#Panels~VerticalPanel
[gwt-animation]: http://google-web-toolkit.googlecode.com/svn/javadoc/1.6/index.html?com/google/gwt/animation/client/Animation.html
[gwt-clickhandler]: http://code.google.com/p/google-web-toolkit/source/browse/tags/1.7.1/user/src/com/google/gwt/event/dom/client/ClickHandler.java

## Free Fall

Inspired by the recent deceptive success, I started to look at the server side interface for the class. In the end, I decided the behavior to be as follows:

 * The Drawer has a caption and one contained component (any `Component`).
 * It should be only as large as the contained component needs to be, but no larger. Fullscreen use is not intended for Drawer.
 * It can have a default caption, but if the contained component has a caption of its own, that takes priority.

The requirements aren't too complicated, wouldn't you agree? That's what I thought, too. Unfortunately, now starts the real problems:

## Problem #1: I Can Has Component?

I knew about sending data from the server component to the client widget via variables and properties (I don't know the difference between the two, honestly. The Book doesn't shed much light on the distinction, either). So, sending puny key/value pairs is not that big a deal. But, the Drawer is meant to contain a whole component inside itself and I had no idea how to send _that_ over the wire. Again, no help from the Book on that topic, either.

How would I paint a component inside a component?

### Solution

After meticulously scanning the code in other similar components, I discovered that this was achieved by just blatantly telling the subcomponent to paint itself into the current `PaintTarget`. This would inject itself into the UIDL to-be-sent. Finding this out took some time, since, instead of having _response.verb(object)_ ( as in `target.addAttribute(foo, bar)` ), it was swapped the other way around, into _object.verb(response)_ ( _&agrave; la_ `subComponent.paint(target)` ).

Here is my solution, simplified, and without appropriate null-checks:

{% highlight java %}
// in Drawer.java
@Override
public void paintContent(PaintTarget target) throws PaintException {
  drawerComponent.paint(target);
}
{% endhighlight %}

{% highlight java %}
// In VDrawer.java
@Override
public void updateFromUIDL(UIDL uidl, ApplicationConnect client) {
 
  // This means that we got a new drawer component
  if (uidl.getChildCount() > 0) {
 
    // remove the previous widget and unregister it entirely
    final Paintable oldDrawerPaintable = (Paintable) drawerPanel.getWidget();
    client.unregisterPaintable(oldDrawerPaintable);

    // Extract the widget from Vaadin UIDL.
    // All Vaadin widgets are both Paintable and Widgets
    final UIDL drawerUIDL = uidl.getChildUIDL(0);
    final Paintable drawerPaintable = client.getPaintable(drawerUIDL);
    final Widget drawerWidget = (Widget) drawerPaintable;

    // After adding the Vaadin widget, it's just a blank Vaadin widget,
    // without any data. You need to manually update it immediately
    // after adding from its own UIDL.
    drawerPanel.setWidget(drawerWidget);
    drawerPaintable.updateFromUIDL(drawerUIDL, client);
  }
}
{% endhighlight %}

## Problem #2: You're Way Too Thin

The one problem that almost made me give up was Vaadin's love for pixels. It injects explicit dimensions everywhere, whether you want it or not. This has to do with Vaadin's Layouts and their various calculations based on the contained components' sizes. You need to be able to provide your dimensions, if someone would ask. And ask they will.

The animation proof-of-concept animation had a fixed height of 300px, very easy to animate: Just use the animation's progress to set the height as 300/(1-progress) pixels, where progress is 0..1, and you're set. Unfortunately, this became a bit tougher when instead of a fixed arbitrary amount, I had to dig it from the containing Component.

### Solution

There are four things you need to do to make this work. After half a week's trial and error, I finally figured them out:

* Both components must be in the DOM tree (see `addWidget()`).
* The contained widget must be actually visible.
* You must call `updateFromUIDL()` on your contained component.
* The wrapping component must implement `com.vaadin.terminal.gwt.client.Container` (not to be confused with `com.vaadin.data.Container` &ndash; a totally different thing). This includes responding to `getAllocatedSpace(Widget)` correctly.

After an awful lot of work you are free to call `subWidget.getOffsetHeight()` and you can expect a reasonable answer. Hooray.

## Problem #3: Sorry, But That's *My* Name

Sending data with properties is about figuring out a string key to identify a value. That key will then be used on the client side to get the value out of the sent data. 

What's not really clear from the Book of Vaadin is that Vaadin likes to inject its own properties into your widgets for your convenience. Adding insult to injury, those property-keys are in the same "namespace" with your properties.

The Book [mentions a few in passing][reserved], but there isn't a comprehensive list of them.

[reserved]: http://vaadin.com/book/-/page/gwt.integration.html

### Solution

Avoid the following reserved keys with your own properties, unless you like mental anguish:

* height
* width
* style
* readonly
* immediate
* disabled
* caption
* icon
* description
* invisible
* cached
* id
* v

This is not an official list, and isn't intended to be regarded as one. I might've missed some reserved strings, or the list might change in future releases of Vaadin.

As you can easily see, some pretty generic keys are used by Vaadin. I would've liked them to be separated somehow, making unintentional key collisions less likely. You could put a prefix to your own properties, to make sure about this on your end. But I feel like it's not something the developer should have to remember to do, frankly.

## Problem #4: Cap'n

I had to take responsibility over the contained Component's caption, since, well, that's what you do in Vaadin. Apparently, Vaadin thinks it shoul be done with a `VCaption` widget, since that's all you are given. I found that strange, since all I needed was a simple `<div>` with a string inside.

### Solution

First off, I had to extract the caption from the `VCaption` widget. Lacking any documentation regarding this, I opened up my OOPHM and debugged the properties I needed to make this apparent hack working.

{% highlight java %}
// in VComponent.java

private final static String VAADIN_CAPTION_UIDL_INVISIBLE__BOOLEAN = "invisible";
private final static String VAADIN_CAPTION_UIDL_TEXT__STRING = "caption";

@Override
public void updateCaption(Paintable component, UIDL uidl) {

	if (component == drawer.getWidget()) {
		if (uidl.hasAttribute(VAADIN_CAPTION_UIDL_INVISIBLE__BOOLEAN)) {
			componentCaptionIsVisible = !uidl
				.getBooleanAttribute(VAADIN_CAPTION_UIDL_INVISIBLE__BOOLEAN);
		}

		if (uidl.hasAttribute(VAADIN_CAPTION_UIDL_TEXT__STRING)) {
			componentCaption = uidl
				.getStringAttribute(VAADIN_CAPTION_UIDL_TEXT__STRING);
		}

		updateCaptionInternal();
	}
}

private void updateCaptionInternal() {
	if (componentCaptionIsVisible && componentCaption != null) {
		captionLabel.setText(componentCaption);
	} else {
		captionLabel.setText(defaultCaption);
	}
}
{% endhighlight %}
  

The `updateCaption(Paintable, UIDL)` method didn't do the job completely, since it is called only when a contained `Paintable`'s caption is actually _changed_. So, I needed to fix the caption also when the component was removed (or the caption would remain in the Drawer's header) and even when the contained component was inserted (because `updateCaption()` doesn't seem to get called then).

{% highlight java %}
public void updateFromUIDL(UIDL uidl, ApplicationConnection client) {
	
	// ...snip //
	
	final UIDL drawerUIDL = uidl.getChildUIDL(0);
	final Paintable paintable = client.getPaintable(drawerUIDL);

	if (drawerHasContents) {
		updateCaption(paintable, drawerUIDL);
	} else {
		clearComponentCaption();
	}
	
	// snip... //
}

private void clearComponentCaption() {
	componentCaption = null;
	componentCaptionIsVisible = false;
	updateCaptionInternal();
}
{% endhighlight %}

In hindsight, I might have avoided all this if I had just sat down and used the `VCaption` Vaadin so wanted me to use. I just don't know.

## Problem #5: Disabled Bookkeeping

One of Vaadin's selling points is the awesome security model: The server holds all the cards, and GWT simply renders the representation. Since you can hack running JavaScript without breaking a sweat, Vaadin mistrusts the client side communications, and easily notices and rejects any hacking. If you call `component.setEnabled(false)`, the component goes into read-only mode and any client-side events are explicitly refused. This is all built-in, you don't have to do anything yourself.

I admit, this will be very close to nit picking. But I am ready to pick nits, when it comes to The Drawer.

My gripe: Even when a widget is disabled or detached from the DOM, it is possible for it to send events to the server. This is no problem, since the server will reject these on its own end. But, each of these will cause an error to be logged to the console. I would not have any of that clutter.

### Solution

You only need one more if-statement. With the Drawer, it was trivial:

{% highlight java %}
private void toggleDrawerVisibility() {
	// the isAttached() and !disabled do the magic.
	if (uidlId != null && client != null && isAttached() && !disabled) {
		client.updateVariable(uidlId, VARIABLE_DRAWERVISIBLE__BOOLEAN,
			!drawer.isVisible(), true);
	}
}
{% endhighlight %}

I just figure Vaadin could do this by itself.

## Lesson Learned

Even though the text might seem like I'm furious about this, I'm not. Ignoring the half-a-week's measuring hell, writing the Drawer was a blast. I got to _really_ use GWT for the first time. I learned a lot about writing complete Components. Throwing yourself off the deep end really makes you learn to swim.

Yeah, sure, there are some things that I wish were different. Then again, the point of Vaadin is not to write your own components. It's actually pretty rare that the Component you need isn't bundled already. However, should you ever feel the need, I think I have shown that it's far from impossible to write one for yourself. 