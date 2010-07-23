---
layout: post
title: Breadth-First Programming
summary: Getting too obsessed with design patterns is counter-productive.
---

A cornerstone of the [test-driven development][tdd] movement is to write the absolute minimum amount of code needed to get a certain unit test to pass. I like that idea. I like it so much, that I want it to be extracted from the TDD world for others to enjoy &ndash; no unit tests required.

After looking at an endless stream of [God of War][gow] how-it-was-made videos and learning the gaming industry's definition of _alpha_<a name="alpha-up" href="#alpha-down">*</a>, and seeing a certain XKCD-strip, I got the idea for this post.

<a href="http://xkcd.com/761/" target="_blank">
<img src="/media/breadth-first-programming/dfs_xkcd.png" alt="An XKCD comic strip on the hazards of depth-first-searching on Wikipedia">
</a>

My idea, in addition to being testing agnostic, it's also both a bit more generic and more specific, than the TDD commandment.

My intended goal is getting modules completed quicker. Faster coding means momentum, which keeps the developers happy. Faster coding means also keeping deadlines easier, which keeps the managers happy.

## Caution: Design Patterns Ahead

My idea is pretty simple: Don't over-indulge yourself in [design patterns][dp].

Design patterns aren't a goal for themselves. They take time to implement, and often unnecessarily so. You don't always need a complete [Memento pattern][memento] to add an _undo_ feature; sometimes a simple `previousValue` field is enough. There's also easier ways to send messages from a class to another than a fully-fledged [Observer pattern][observer]; a lone observer can be given to the notifier via a setter without any special interfaces.

Consider the following piece of code:

{% highlight:java %}
public enum Command { CHECK_MAIL, BREW_COFFEE }

public void execute(Command command) {
  /*
   * In case this switch/case block grows over four cases long, switch 
   * to Command pattern (http://en.wikipedia.org/wiki/Command_pattern)
   */
  switch (command) {
  
    case CHECK_MAIL:
  	  checkMail();
      break;
      
  	case BREW_COFFEE:
      brewCoffee();
      break;
  }
}

private void checkMail()  { /* ... */ }
private void brewCoffee() { /* ... */ }
{% endhighlight %}

I can't remember how many times I've heard people saying that switch/case blocks do not belong to <abbr title="Object Oriented Programming">OOP</abbr>. But what if, once you've completed your application, you notice the only actions your application ever will do is check the mail and brew a cup 'o joe? Wasting your time creating interfaces, classes and generic code is actually doing there is downright embarrassing to a sensible programmer. 

In a worst-case scenario, it might even make the application's abilities less obvious, just by reading the code. Imagine the aforementioned code replaced by a generic `Command` interface. You'd know that the application can execute commands, and supposedly it has some, but you'd have to use an IDE to know that there's only two measly commands it ever executes!

The most important piece of the code, however, is the comment. It states clearly that, in case more than four commands are listed, it's time to switch over to a proper pattern. In your respective comments, figure out one number representing the amount of acceptable "jerry-rigging". If you would just write "...when these get too many...", you wouldn't be exactly clear just what _too many_ is, possibly allowing the list to grow into a hairy ball of spaghetti.

But I'm not advising against using design patterns. Patterns are excellent, when used with cause. I'm just saying that certain shortcuts are ok, just as long as you prepare the code in such a way that it's near-trivial to yank the code out, and convert it into a shiny, polished pattern _du jour_.

## Why Should I Do This, Again?

Developers love to polish their code into perfection. The trouble is, polishing kills momentum. Also, if it turns out that something you have polished for days on end is unnecessary after all, it's very hard to throw it away. It has become your baby, and you're attached to it. You would do your best to try to keep it around: The baby of polished, useless code.

So, Breadth-First Programming is about completing your project as fast as possible. This way, you know what code you need to have to make it work. Unpolished code is easy to throw away, leading to optimal codebase. 

Think of it, instead of "writing the absolute minimum amount of code needed to get a certain unit test to pass", as "writing the absolute minimum amount of code needed to complete your application". Once you're done with the breadth of the code, you're free to add depth to it. Since you're now ahead of your schedule, it's refactoring time!

<span style="font-size: 80%; line-height: 1.5em"><a name="alpha-down">* The way the gaming industry defines an alpha release is when all the gaming elements are in place. Levels can be navigated as they should, the power ups and items are in their place, etc. The graphics might still look like crap, textures are missing, and the final polish isn't there. But the feel and the gameplay mechanics are in place, from start to finish. <a href="#alpha-up">back up</a></span>

[memento]: http://en.wikipedia.org/wiki/Memento_pattern
[observer]: http://en.wikipedia.org/wiki/Observer_pattern
[dp]: http://en.wikipedia.org/wiki/Design_pattern_(computer_science)
[gow]: http://en.wikipedia.org/wiki/God_of_War_(series)
[tdd]: http://en.wikipedia.org/wiki/Test-driven_development