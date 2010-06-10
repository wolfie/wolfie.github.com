---
layout: post
title: Method Hierarchies
summary: Sometimes, the IDEs don't help us enough to write the best code we can.
---

Jim walks past my desk, on his way to the coffee machines. He gives a purposeful, not-very-subtle, sigh, so I reply to him with a "so, what's up now?"-look. He says he's hunting for a bug in a class that's over 1500 lines long, split up into a huge amount of private methods. He can reproduce it at will, so he knows pretty eactly where the bug is in within the application, but since he hasn't written the code, it's a jungle. So he's fetching his motivational cup of coffee, to get him started on finding where that code containing the bug is.

Since I'm somewhat familiar with his project, I could've asked for more details and then hazard a guess about what's wrong and where to start. Instead, my mouth goes off: "Yeah, but imagine what it would look like, if all those methods would be in-line?" I ask rhetorically. I then stubbornly continue, before Jim had the chance to interject to my unhelpful and unsymphatetic comment: "Instead of you having a couple methods of 500 lines each, you now have a handful of methods that are significantly shorter, each with a descriptive names about what they do."

"But it's just silly," Jim replies defeatedly. "If a method is private, and it's called from exactly one place for exactly one purpose, why can't it just be in-lined? This way I wouldn't have to jump and skip between methods to know what it does, and how it mangles the data? How else am I supposed to find the bug?"

And I realize that Jim has a point: Reading highly fragmented code to find a particular bug is tedious. But I refuse to say that my point is any less valid: Any one method is easier to read and understand the less code you have to decipher.

Unfortunately, it seems like we can't have it both ways.

## Exhibit &ldquo;A&rdquo;

Take a look at Robert C. Martin's (aka. Uncle Bob) [_Bad Code_ talk][badcode] &ndash; the bit between 00:14:25 and 00:21:35. Do that right now. Watch the snippet, and come then back here.

[badcode]: http://www.infoq.com/presentations/Robert-C.-Martin-Bad-Code

I don't agree with his enthusiastic four-ish lines per method vision, but his the idea of small, single-purpose methods is intriguing. What he's _really_ saying, I believe, is that, on the job, you don't write code for yourself, but for posterity. _You_ might understand what you just wrote (for now, at least), but the _future maintainers_ usually don't have a clue. Splittin code up into fine-grained methods and labeling them with meaningful names would guide the reader about what's going on.

Alas, Jim's problem still exists: A class that has 1500 lines of unfamiliar code, containing 100 unfamiliar methods, and you know that there's one bug lurking somewhere between the button press event and the render phase. Where to start?

## Exhibit &ldquo;B&rdquo;

Take a look at [Code Bubbles's][codebubbles] demo video. You need to watch only the three first minutes to get good a grasp of the idea. 

It's an idea of a complete IDE that allows the developer to see the code by placing individual functions into small bubbles, as they call them. The developer can then sort and organize them visually, seeing how code relates. All this is placed into an impossibly large, scrollable, virtual desktop. 

[codebubbles]: http://www.cs.brown.edu/people/acb/codebubbles_site.htm

While being a refreshing point of view, a decent attempt to bring something new to the code-writing world, I think that's a bad idea. I don't want to _write_ my code that way. 

## But What If&hellip;

Imagine having at your disposal such a _view_ in your current favourite IDE? Pick a class, switch into this view mode and &ndash; boom &ndash; you're presented with a detailed code call hierarchy, in a nice graphical tree structure, code properly highlighted, blocks being foldable, and so on. This mode would not be intended to write code in, but to navigate code. To read code. To _understand_ code.

You'd get best of both worlds: Those who already know a bit about the code can find methods even faster, and total newcomers to the code can navigate their way through the code faster and with ease.

The IDEs don't currently help us with this task enough. Method overviews do give a list of method signatures, but that's merely a list, arbitrarily sorted. The Call Hierarchy feature found in Eclipse does do something like that, but it's not nearly powerful enough. We need a "I have found a bug on unfamiliar territory, help me find it"-feature. 

Both Jim and I do.