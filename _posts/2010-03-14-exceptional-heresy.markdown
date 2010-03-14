---
layout: post
topic: Exceptional Heresy
summary: In this article, I propose the elimination of nulls and more rigorous use of exceptions than used to in the past.
---

During the last two years of writing Java professionally full-time, I have started appreciate the aspects in which it's good at, which, ironically enough, I previously despised in Java: Its explicitness. Another attitude change I've had during the last few months is that I've started to hate `null`s, and hate is something I tend to save for only the few and worthy causes.

By eradicating the use of `null`s in Java, I believe we will have better error handling, see Exceptions as awesome features and less crashes in our software. 

## Exhibit: Exception

Everyone has heard it: _"Don't use exceptions for control flow. Exceptions should be left for when something exceptional happens"_. Heck, I too have preached that to others, red in the face. This is where I want to take the opportunity and tell those how sorry I am about that.

Here's a question, and think fast: where should the line be drawn between a checked exception (subclasses of [`Exception`][jexc]) and runtime exceptions (sublasses of [`RuntimeException`][jrexc])?

[jexc]: http://java.sun.com/j2se/1.5.0/docs/api/java/lang/Exception.html
[jrexc]: http://java.sun.com/j2se/1.5.0/docs/api/java/lang/RuntimeException.html

If you succeeded to think of a coherent answer within ten seconds, I wish you a good day and encourage you to stop reading this post, and find something else constructive to do. For the rest of us, here's some quotes off <strike>Sun</strike>Oracle's [tutorial pages][tut2]:

[tut2]: http://java.sun.com/docs/books/tutorial/essential/exceptions/catchOrDeclare.html

> [Checked exceptions] are exceptional conditions that a well-written application should anticipate and recover from. [...goes on about an exception where an user-input string refers to a non-existing file, throwing a FileNotFoundException...] A well-written program will catch this exception and notify the user of the mistake, possibly prompting for a corrected file name. 

Also

> [Runtime exceptions] are exceptional conditions that are internal to the application, and that the application usually cannot anticipate or recover from. [...continues with an abstract example with a NullPointerException]

So, checked exceptions are ..uh.. not-very-exceptional exceptions, and runtime exceptions are ..er.. a-bit-more-exceptional exceptions. Uh, right. This didn't clear up things all that much after all, did it. 

Before I present my proposal, let me paint a picture...

## Excavating an Explanation

I have trust issues: I distrust myself when it comes to writing code. After all, the odds are against me. I will leave a bug behind somewhere, sooner or later. Thus, anything that can immediately show me that I've introduced a bug in my code is awesome. That's what I love about, say, [generics][jgen]. Today, very few bugs are caught compile-time. Today, one of the good practices of eliminating the possibilities of a bug getting through unnoticed is readable code. Truly readable code.

[jgen]: http://java.sun.com/j2se/1.5.0/docs/guide/language/generics.html

### Readable Code, or Is It?

Look at this snippet:

{% highlight java %}
shoppingList.add(milk);
{% endhighlight %}

What do you think the code does? If you would read it as normal prose, it might be something like _"shopping list, would you add milk, please?"_ Pretty straightforward, can't be misunderstood and it's totally compatible with Java coding conventions. Awesome. Okay, here's the next one:

{% highlight java %}
if (!shoppingList.add(milk)) { shout(); }
{% endhighlight %}
    
Let's try solving this with the same method: _"Shopping list, if you don't add milk, please shout"_. Sounds a bit clunky, but it's in the ballpark. But are we done? No. While that's what the code might read, that's not what the code _does_! A complete version would be _"shopping list, if you don't add milk, please shout. **But try adding anyways**."_ You might be familiar with such minutiae already, but that's still a hidden action that didn't read out loud. Let's try with another approach:

{% highlight java %}
wallet.get(bankNoteValue);
{% endhighlight %}

_"Wallet, give me a note with this certain value"_. Admittedly strange thing to ask your wallet, I usually just get the note out, but let's build further on this example.

{% highlight java %}
BankNote note = wallet.get(bankNoteValue);
payGoodsWith(note);
{% endhighlight %}

_"Wallet, give me a bank note with this certain value, and use it to pay my goods."_ (Please ignore the fact that `Goods` should be parameterized in proper code.) While the above makes perfect sense to almost anyone, we coders should immediately notice one crucial fact: That's way too straightforward.

## Null Hypothesis

To write Proper Code, we need code that reads funny:

{% highlight java %}
BankNote note = wallet.get(bankNoteValue);
    
if (note != null) { payGoodsWith(note); }
else              { cancelPurchase(); }
{% endhighlight %}

_"Wallet, give me a bank note with this certain value. If you gave me something else than nothing, use it to pay my goods. Otherwise, cancel the transaction"_. Ah-ha! **But I never asked for "nothing".** I quite clearly remember asking for a bank note with the value of `bankNoteValue`. Aren't computers supposed to be dumb and do _exactly_ what are asked of them? 

Be how it may, this shows two big problems in everyday Java code: First, every time you get a `BankNote` out of a `Wallet`, you must remember to do a `null`-check, or risk a `NullPointerException`. The second problem is that perhaps `payGoodsWith()` can already handle `null` arguments properly, and it would've called something equivalent to `cancelPurchase()` internally in those cases. This would lead to us having duplicate checks – code in two different parts of the application doing the very same thing. You can't tell for sure, just by looking at the code.

This can be avoided a bit by practicing [Design by contract][dbc], but I've never heard of anyone really doing that. Besides, that would just lead to more documentation you'd be required to read when calling a certain method, and that's hardly what we want; more things to keep in mind.

[dbc]: http://en.wikipedia.org/wiki/Design_by_contract

One last piece of code:

{% highlight java %}
List<File> files = getFiles();
for (File file : files) {
  System.out.print(
    file + " is a " + (file.isDirectory() ? "directory" : "file")
  );
}
{% endhighlight %}

If you can't immediately spot the two sources of possible `NullPointerException`s in this very run-of-the-mill code, you're pretty much doomed to repeat them in your own code. Once you do spot them, what do you think about the readability once all proper checks are in place?

What if you could get a compile-time error whenever you don't handle method calls properly?

## You Say _What_?

Here are my two proclamations I've teased with: "`null` should be outlawed" and "_use_ exceptions for control flow". While they might seem two different things, they are, in fact, very much intertwined.

So, some might say that `null` is convenient. Some might say it could act as a default value when given as an argument into a method. Some might say `null` could be returned as an indication that some operation failed, that normally would have returned A Real Object.

I say `null` is the Devil's tool. Default arguments can be implemented by [method overloading][sun_overload] and sane API:s. `Null` should _never_ be returned by a method, since it's never what we asked for. I say if a `null` enters a system, you never know when it pops back up, more often than not causing `NullPointerException`s. There's a better way.

[sun_overload]: http://java.sun.com/docs/books/tutorial/java/javaOO/methods.html

Here's the wallet example revisited:

{% highlight java %}
BankNote note = wallet.get(bankNoteValue);
    
if (note != null) { payGoodsWith(note); }
else              { cancelPurchase(); }
{% endhighlight %}

How about if we rewrite it like so:

{% highlight java %}
try {
  BankNote note = wallet.get(bankNoteValue);
  payGoodsWith(note);
} catch (OutOfNotesException e) {
  cancelPurchase();
}
{% endhighlight %}

_"Wallet, give me a bankNoteValue note, and I'll use it to pay for my goods. Oh, and if you're out of notes, let's just cancel the transaction."_ 

Now _that's_ readable code, if I've ever seen any. Not only does it read better, it forces me to handle the error non-intrusively. First comes intent – what we _really_ want to do – and only then does the when-the-shit-hits-the-fan code come in, without cluttering the interesting bits.

The three goals achieved by this way of thought:

 1. You don't have to _remember_ to do error handling. Your code simply won't compile unless you handle the error cases.
 1. Once your methods never return `null`s, you will get significantly less sudden `NullPointerException`s.
 1. When reading unfamiliar code, the [happy path][wiki-hp] is right there in front of your eyes, and you don't have to search for it.
 
[wiki-hp]: http://en.wikipedia.org/wiki/Happy_path

The last point, in my mind, is the thing that should appeal to those who appreciate their (or their coders') time. When reading someone else's code, you are only interested in what the code _really_ does. When you're certain that each `if` has an important role to the business logic, and there's no error handling masqueraded there in the mix, you're able to figure out the flow of the code much faster. All this leads to less frustration (thus cost) during maintenance.

## Heretic! Heretic?

So, here I am, encouraging the use of exceptions as control flow. Actually no, I lied.

As you know, exceptions are events that really shouldn't have happened. Like I showed in a previous example, when I call `getFoo()`, I actually expect to get a `Foo`. If I don't get it, it's by definition an exceptional event. To those who still think that exceptions should be reserved for those truly voodoo-freaky moments, I present you to runtime exceptions. Since Java has two kinds of exceptions, why not make both into good use?

Related, those `NullPointerException`s have caused too many bugs already. In fact, last Tuesday I opened five new bug tickets in a couple of hours in our project. All were about NPEs. And I wasn't even trying to test! It's just ridiculous that for _virtually every returning method_, you must add a `null`-check for the case when you don't get what you asked for. Even Java itself is to blame in this aspect; the default implementations for the [`Collection`][jcoll] and [`Map`][jmap] interfaces are full of `null`s, flying to and fro.

[jcoll]: http://java.sun.com/javase/6/docs/api/java/util/Collection.html
[jmap]: http://java.sun.com/javase/6/docs/api/java/util/Map.html

By using exceptions to their full potential, you can be assured that improper error handling is never your code's fault. By actively rejecting (by throwing your own NPEs) and never returning `null`s, you can be assured that any `NullPointerException`s are never your code's fault.

## The Breakdown

To make my thoughts as clear as possible, here's my recommendations for each of the three concepts involved:

### Checked Exceptions

If a method fails, you should not return `null` or, even worse, an arbitrary integer to signify this situation. When circumstances prohibit the code to fulfill the task it was doing, throw a checked exception. This way you can be sure that the client code will be explicitly warned that there are some things that can go wrong. No more do I have to document what a returned `null` might signify. No more does client code watch out for `null`s.

### Runtime Exceptions

Runtime exceptions are designed for those weird unforeseen and unrecoverable situations, and I have no objections here. When the shit really hits the fan, and conventional error checking won't suffice, a runtime exception is what is needed. This is where a [fail-fast][failfast] is better than walking around crippled. If the client code thinks it can handle it, it's welcome to catch it. All thrown exceptions will be documented anyways, _won't they?_

[failfast]: http://en.wikipedia.org/wiki/Fail-fast

### Nulls

Any `null` given as an argument should throw an NPE first thing. This ensures no `null` sneaks into your code, getting stored in a variable somewhere, causing an NPE in a totally different context. These kinds of bugs are always hard and time-consuming to debug. 

I suggest you to write a util method that accepts an `Object` [vararg][vararg], iterate through each element and when `null` is encountered, throw an NPE. Then each method can call this utility method with all its arguments as parameters. 

[vararg]: http://java.sun.com/j2se/1.5.0/docs/guide/language/varargs.html

Since `null`s are strictly prohibited to enter the method, there's no reason a method should return it. Throw a descriptive checked exception when something went wrong. That's the contract you will be designing your methods on from now on: no `null`s, in or out. This will make everyone happier, trust me.

## Final Thoughts

Java was designed to be a robust language. It's so verbose, because it's so explicit. It's so explicit, because it's so verbose. If you want something quick'n'dirty, Java is not the right tool for you. On the other hand, if you want something that's reliable and verifiable, Java is a decent candidate. But I assume that's a given already.

So, since Java has this fine feature called exceptions, why not use it for its full potential?