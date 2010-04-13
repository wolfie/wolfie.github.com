---
layout: post
title: Fitts's Outlaw
summary: With the advent of large touchscreen computers, Fitts's law simply doesn't work.
---

If you have had anything to do with interface design, you probably have heard of [Fitts's law][fittsslaw] (Particletree has [a great visualization][pfittsslaw] on it). In case you've missed it, the law, in essence, is about the ease of clicking on something. It can be distilled into two simple claims:

[fittsslaw]: http://en.wikipedia.org/wiki/Fitts's_law
[pfittsslaw]: http://particletree.com/features/visualizing-fittss-law/

 1. If an element is close to the cursor and large in size, clicking on it is easy. Inversely, if an element is far away from the cursor and small in size, it's a hard target.
 1. Elements at the very edge of the cursor area have an infinite size in the direction of the side it is placed against.
 
Since I like to optimize; instead of explaining in 1000 words, I've done something for you to play with. Place your cursor over the text, and try to click on the button that appears on its right side. (Sorry, JavaScript required.) Try each one a few times over to get a feel to them.

<table style="border:0;width:100%; background-color: #eee;">
	<tr>
		<td style="width:50px; padding:1em;" id="easycursor">Cursor here</td>
		<td>
			<button style="width: 100%; height: 50px" id="easybutton">
				<span style="font-size: 40px; font-weight: bold">Click Me</span>
			</button>
		</td>
	</tr>
	<tr>
		<td style="width:50px; padding:1em;" id="hardcursor">Cursor here</td>
		<td style="text-align:right;height:50px;padding:1em;"><button id="hardbutton" style="font-size:smaller">x</button></td>
	</tr>
</table>

<script src="/media/fittss-outlaw/demo.js" type="text/javascript"></script>

Once you're done playing around with the examples above, you probably noticed that the button above is much easier to click with your cursor than the lower one. This applies equally for mice, trackpads, and those [little red torturing devices][trackpoint] on all ThinkPads.

[trackpoint]: http://en.wikipedia.org/wiki/Trackpoint

Perhaps more importantly, and notably impossible for webpages to demonstrate, the second point can be seen in action when your maximized window has a scrollbar: You can simply flick your cursor all the way to the right and start scrolling. You don't have to concentrate on stopping the cursor in time, to avoid overshooting. The edge of the screen will stop the cursor, effectively making the scollbar infinitely wide to the right.

That's Fitts's law in action for you.

## New Kids on the Block

Oh, how my sis loved them. But I'm not talking here about questionable taste of music. I'm talking first and foremost about the [iPad][ipad]. While all kinds of touchscreen devices have been around for a long time, in all shapes and sizes, the launch of iPad really got the hype for slate-thingies all over the media. This got me thinking...

[nkotb]: http://en.wikipedia.org/wiki/New_Kids_on_the_Block
[ipad]: http://www.apple.com/ipad/

These touchscreen devices break the law. They act like Fitts's law doesn't apply to them. 

And it doesn't, with good reason. What has been [one of the cornerstones][wimp] of desktop design, the edges and corners of the screen totally lose their magical properties. While a pixel all the way to the bottom right corner of the screen is easy-peasy to click on with a mouse, it's nearly impossible to tap on it accurately with your finger. What previously has been the absolute sweetspot for mice, has become totally unusable with fingers.

[wimp]: http://en.wikipedia.org/wiki/WIMP_(computing)

Also, something interesting has happened to successive actions on the same place. If you have just clicked a button with your mouse, it's very easy and fast to click it again. But, with your finger, it's not as fast to re-tap something, since you always lift your finger and thus reset your aim each and every time. 

On the other hand, if the button moves to a random location after each click, it's very easy to find and tap it with your finger, while it's laborous to aim and hit with your mouse. 

This kind of hand-eye coordination is something that you have practiced since you were born. Nay. This is what primates have been practicing the last 85 million years! The last 40 years of mousing history is nothing compared.

## Fat's Law

That's what I'm going to call my alternative; Fat's law. This law is much easier to remember than Fitts's law. This should be reason enough for everyone be happier. Fat's law states:

**Larger things are harder to miss.**

There. That's it. Forget relative distance or mathematic formulae. The bigger it is, the easier it is to hit, period.

The reason why Apple thinks the iPad keyboard is so great, while it's simply an upscaled iPhone keyboard? Exactly for that reason - it's <em>upscaled</em>. Ever thought why those cellphones for the elderly have such big buttons and fonts?

## Rewrite Everything

I'm not saying Fitts's law is old, gone and to be forgotten. Not at all. It should be noted that the desktop as a platform is not dead, and continues to be not-dead for a good amount of years in the future. 

I'm saying that since we will start having more and more touch devices, developers need to take this into consideration. And those of you thinking of directly porting an application from a mouse environment into a touch environment &ndash; please, don't bother.
