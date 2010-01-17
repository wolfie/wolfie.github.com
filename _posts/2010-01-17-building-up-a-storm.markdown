---
title: Building up a Storm
layout: post
summary: A post where I contend the use of XML in general, more explicitly in existing build systems, such as Apache Ant.
---
I'm happy to notice that XML is on its way out. Java, which I believe to be the main culprit of XML profileration, is finally understanding that XML is not what people want to write, with them moving towards [annotations][wp_ann] based configuration.

[wp_ann]: http://en.wikipedia.org/wiki/Java_annotation

I, like many other developers, heartily welcome this trend. And to celebrate this (and to have something to do while Nokia gets its act together [[1]][tw_maemo] [[2]][news_maemo]), I declare a war upon XML misuse, such as [Apache Ant][ant]. My decree is to provide a simple build system that doesn't involve XML. 

[tw_maemo]: http://twitter.com/henrikpaul/status/7833668818
[news_maemo]: http://maemo.org/news/announcements/repositories_down/
[ant]: http://ant.apache.org/

While Ant is by no means hard to learn, the idea of a) writing XML b) how that XML is used, is something that's just off-putting. I mean, XML should be used to convey information. _"Extensible Markup Language"_. A _language_ in which to _mark_ stuff _up_. It's not intended for scripting, and Ant is basically using XML as a scripting language.

## What Should it be, then?

There are some requirements that I have figured out. They reflect the idea of a small, easy-to-use, quick-to-setup system that does what larger, clunkier suites _effectively_ do.

### Native Java

Using native Java draws the benefit of IDEs' integrated code completion and API documentations.

Also, because I already know Java, why should I need to learn another domain specific language just for this activity? Having decent build scripts in a project is a good thing, and should be done by everyone. The tools should not leave the coder's comfort zone.

Oh, and it's not XML. Did I mention no XML already?

### Easy to learn, code and run

This goes without saying. If the learning curve is steep, it won't be picked up by own initiative. If coding in it isn't easy, it's a chore to maintain. If running isn't easy.. yeah, well, it you wouldn't run it.

### Clean Syntax

Although this is a part of the requirement above, keeping the syntax clean adds intuitiveness, reducing maintenance woes and generally encourages usage.

### Non-invasive

The build system shouldn't require much from your project. Some default assumptions should be ok, but those assumptions should be configurable. The build process shouldn't produce much litter, and the litter it leaves behind should be easily cleaned up and excluded in a SCM.

### OS independent

In the spirit of information hiding, and portability, if the script works in one computer, it should work on all computers. If (and that's a big '_if_') something is environment-specific, it should be 

### Packages JARs, WARs and the like

A build system should produce artifacts as a result of the building, so without these, the whole thing would be useless. Since this is a Java-centric builder (wouldn't make much sense to write Java code to build a, say, Python project, would it), JARs are the most important one. Since I'm working with Java EE, WARs are important for me. Packaging EARs, RARs and what-have-you-ARs come in at some point.

### Runs JUnit tests

Since you want to know whether you are packaging something that works, JUnits should be integrated too. I know that JUnits should have a special position in the whole scheme, but I'm not really sure yet what that position is.

## What I've Got Thus Far

Let's look at some concept code that I have up in Eclipse. The first snippet:

{% highlight java %}
public class Default extends Build {
  @Override
  public Result build() {
    return new Jar();
  }
}
{% endhighlight %}

Pretty straightforward. This is the most basic build. This would be run when the build is run without any parameters, identified by the default package, `Default` class name and the `build()` method name. The file is assumed to be found in a source directory called "`build`" from the project root. The build source directory will be configurable.

`Build` is an abstract class that has an abstract `build()` method that is the default build method for each class. Each build class must extend this class. Each build target must return an instance of `Result` (or `null`, if the build doesn't produce anything).  Each `Result` will be placed as a file (or many files) within the project path.

The `Jar` object reflects that we want our project to be built into, a JAR file. By default, the project is compiled from the sources from a source folder named "`src`". The resulting classes will be included. This will also be configurable. A default manifest file will be included, and sources would be excluded.

Looking at a more explicit code example:

{% highlight java %}
@Target
public Result testWar() {
  final War war = new War();
  war.setIncludeSources(true);
  war.addLibrary("lib/vaadin.jar");
  war.setWebXML("WebContents/web.xml");

  return war;
}
{% endhighlight %}

This is another non-default build target, called `testWar`. Here we will include all sources in the resulting packages, but also the compiled classes. We add `vaadin.jar` as a library, and the `web.xml` file is also explicitly pointed out.

All paths are always relative to the project root.

## Voice Out!

This is a rough overview. There are lots things that still needs to be thought of. There are also a lot of cases that will not be supported. There are also a lot of stuff that I have already an idea about, but haven't included here, simply because I'm not though thinking about these. The above is just to give a taste and feel of how it might look like.

Since I'm not expecting anyone to contribute with code, but opinions are abundant, what do you think? 

Did I miss out a crucial requirement? Would you use native Java to build your project? Would you, for starters, just sit back and see what this amounts to? Is this simply a huge waste of time?