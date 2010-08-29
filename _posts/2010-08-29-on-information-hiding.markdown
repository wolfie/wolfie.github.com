---
layout: post
title: On Information Hiding
summary: Today I write about my thoughts on information hiding, why I think it's awesome, and don't really understand those who oppose it.
---

_Caution: Starcraft 2 is addictive and may hinder blog post writing. End of public service announcement; returning to the scheduled programme in 3, 2, 1&hellip;_

Recently, I've had two notable encounters of a specific topic that I simply need to address in the form of this blog post. Today's subject: **Information hiding**, i.e. making fields or methods something other than public.

After I read [Code Complete](http://www.amazon.com/gp/product/0735619670?ie=UTF8&tag=lightfdevblo-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0735619670) a few years back, it simply dawned upon me why information hiding is totally awesome. But it seems that all too many programmers haven't read it, and therefore I have met people being confused by the idea. Not confused in the "what does it mean?"-way, but rather in a way that they can't see the point.

The main comments I've heard against information hiding can be summed up in "It won't make your software any more secure, since I have [reflection](http://java.sun.com/developer/technicalArticles/ALT/Reflection/) anyways" and "Why can't I access this private field I absolutely need?"

## Hiding in Security

Let me be absolutely clear about this: **Information hiding and software security should have nothing to do with each other.** If you ever notice those two concepts mentioned between a set of covers, and it's not a CS basics book, you should burn it and demand your money back. Yes, in that order. 

If you _would_ use information hiding as a software security measure, it would be nothing more but [security through obscurity](http://en.wikipedia.org/wiki/Security_through_obscurity), and that's _bad_ (usually regarded as one of the seven deadly sins, it being the eighth). So just don't do it.

## Being Just a Nuisance?

The other argument is regarding the case where you have decided that in order to make your code work, you need to access something inaccessible. You have read all the code, and are sure that it won't break anything. It's almost as if it has been put out of reach, just out of spite.

I can almost buy this argument. Almost. But this will violate a few things, and here's just a few of them:

### Optimization

Whenever I write code, I try to find the shortest path between the current state of the code and the required functionality of the application, with additional business requirements taken into account. **This is optimization of development time**: There are a lot of things that might need to be taken account, but I choose not to. Instead of constantly verifying all variables in my code in case of a stray [cosmic ray deciding to flip a bit][googleray] in the computer, I choose to spend my time instead making the log-in screen to the database manager work.

[googleray]: http://www.google.fi/search?q="cosmic+ray"+"bit+flip"

My point is that I write the parts I need to make stuff work my way as fast as possible, making as many assumptions and quirks as I possibly can get away with. (Again, I mean this in the most literal way possible: I do make assumptions and take shortcuts, but I choose them carefully, to avoid bugs and unnecessary spaghetti code.) Should I unnecessarily leave stuff public, those who code against my code might, in good faith and by honest accident, change the internal behavior of the code, making everything fail in a glorious ball of fire. If I proactively disallow access to the internals of my code, **I proactively make it harder for others to do mistakes and weird bugs.**

Case in point: Take `java.lang.Integer`, having a private `int value` field that stores the primitive integer value of the `Integer` object. Imagine for a second that you could do the following:

{% highlight "java" %}
Integer i = Integer.valueOf(1);
i.value = 3;
System.out.println(i); // Output: "3"
{% endhighlight %}

Innocous enough, right? And it might even work pretty well with JDK versions 1.4 or lower. But as soon as you upgrade to 1.5, that would probably bring down the whole JVM. This is because [`IntegerCache`](http://kickjava.com/src/java/lang/Integer.java.htm#556) got introduced in 1.5.

Between lines 559 and 586 you can see that the JVM has a cache of integer objects of -128, 127 and everything in between. Since the `Integer.valueOf(1)` returns a cached instance, and we've just modified that instance's internal value, we have essentially asserted to the JVM that 1 = 3. Oops!

As a casual programmer, there's no way you could've known this change. And that's the whole point. **As a casual programmer, you shouldn't need to know these kinds of changes.** It's internal optimization, made possible by informaiton hiding.

### Refactoring

If everything you write in a class would be public, there's nothing stopping the client code from using _everything_ in that class, intended to be touched or not. This means, if you change even the slightest thing in your class, there's a high possibility that the client code will break. This will effectively kill off any safe way of [refactoring](http://en.wikipedia.org/wiki/Refactor) your code.

I like to break down my code into the smallest chunks possible. I usually have a handful of private methods for each public method. This helps me to **unload the cognitive load** of any piece of code, since I'm looking at less code on a higher level of abstraction. Instead of an in-lined for-loop, I might have a single-purpose method that describes what the for-loop does. It's not that I'd strictly _need_ a method but, but it's a way of both commenting what the code does, and simultaneously reducing the lines of code per eyeful. This way, I can get away with not writing actual comments for my code.

Now, if all those private single-purpose utility methods were public, all kinds of horrible things might happen. Someone might've found a particular algorithm that they find useful, and they start using it directly from my code. This would mean that either I keep the method around forever, whether it becomes obsolete or not, or I break the API. Even worse, if I had a bug somewhere in there, and some 3rd party code would actually rely on that bug. I'd be royally screwed, since I can't make my code work correctly, without making someone else's work incorrectly.

This problem is especially prominent in general purpose libraries intended for public distribution. But controlled and contained projects aren't exempt from this problem either: Even if you could communicate to everyone what you are doing, and tell everyone to take this into account, **you're adding one more rule to remember** into everyone's (already excessive) cognitive load. That's not exactly fair, if you ask me.

### Being Lazy is Being Effective

Which brings me to the following point point: The most awesome side-effect of generous information hiding is **allowing yourself to forget as much as possible**. My brain's working memory is very small, and I imagine other people suffer from this too. Merely trying to remember three arbitrary numbers all while writing code for them is a guaranteed failure for me. So trying to remember the minute implementations of a certain class I'm using is simply not going to work for me. If I need to know how to jiggle fields, call various magic methods in a specific order, and that sort of thing, I'm guaranteed to write a huge load of bugs.

That's why I keep as much as I can get away with out of the public scope. I name my methods descriptively (long names, if needed), and try to hide as much as the details as possible into the private scope. A few months later, when I have happily forgot the implementation details of a particular class, I can simply use my IDE's auto-complete feature to tell me what it can do, and I can be damn sure that there's no clutter, and no pitfalls to watch out for. There's only the methods I need to be bothered with, and **that's all I need to remember and take into account**.

### There's This One Case, However&hellip;

There's one case where information hiding is actually a nuisance: A pseudo-extendable class.

What if there's a class that is not explicitly made non-extendable. You try to extend it, but there's some little piece of information that you can't reach, but would be forced to in order to make the extension useful in any way. 

There's usually two things that might've happened here: 1) the developer has forgot to disallow class extension (which, in my mind, should be the default in Java), or 2) the developer has encountered the brutal fact that allowing extension of a class is damn hard to do properly.

Making an extensible class requires you to know pretty much all the ways the class is going to be extended. It's a lot easier to go about the [breadth-first approach](/2010/07/20/breadth-first-programming.html), by first programming the code, and then extracting a common, extensible class, out of what can be generalized. Sometimes, however, you are forced to make a class extensible for extendability's sake, and this is where things are _so_ easy to break.

So, what could you do about it? File a bug report, and hope real hard they open up the API instead of realizing that the class should've been final in the first place. Or you could be content with reflecting whatever you need. In the latter case, however, if anything fails, it's your own fault. In any case, I wouldn't count this against information hiding _per se_, but a mere design error.

## Now, Where Was I?

By now, it should've become apparent that I like information hiding. I wish it's now apparent _why_ I like information hiding, too; it helps me a lot with my programming. Information hiding might be unnecessary in small and trivial applications, but since I haven't done much of trivial work in a good while, I've since denounced that. In non-trivial projects, it's a shortcut to poor software design and spaghetti code.

If you still think information hiding is stupid and evil, feel free to think that. That's fine. I don't judge you &hellip; much.