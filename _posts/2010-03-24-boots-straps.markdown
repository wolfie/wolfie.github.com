---
layout: post
title: Boots' Straps
summary: Bob can finally bootstrap itself!
---

So, I've been writing on and off (well, more _off_ than _on_ recently) on this build system I call Bob. The core idea is, basically, to keep Ant's simplicity, and throw out rest of the ugly.

Its state is currently somewhere between "code slapped together" and "first alpha". But the first milestone has been achieved: Bob can bootstrap itself, i.e. it can wrap itself into an executable JAR only using its own executable JAR. Mind-bending.

Have a look at the _entire_ Bob build class:

{% highlight java %}
import com.github.wolfie.bob.action.Action;
import com.github.wolfie.bob.action.Jar;
import com.github.wolfie.bob.annotation.Target;

public class Default {
  @Target(defaultTarget = true)
  public Action build() {
    return new Jar("result/bob.jar").useDefaultManifestFile();
  }
}
{% endhighlight %}

This compiles and runs the build class, then compiles the project, slaps it into a JAR and throw in a manifest file for good measure. Next, the only thing I then need to write in my terminal is "`bob`" and out comes...

	wolfie> bob
	[Jar] Wrote /Users/wolfie/Documents/workspace/Bob/result/bob.jar
	[Bob] Build complete
	wolfie>

Shazam! 

More to come. But this is what I've got today; shazam.