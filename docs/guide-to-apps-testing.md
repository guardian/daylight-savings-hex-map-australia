Guide to Testing Interactives on Apps
=====================================


## HTML/CSS/JS issues in Apps Rendering 

If Apps Rendering has been rolled out (expected April 2021) it will be much easier to debug pieces that have gone live. 

1) Take a live guardian url 
2) Open the Teleporter extension and click "Apps Rendering" - this view replicates the React html/css/js that is inserted into the shell of the native app. 
3) Debug as normal using your browser console.

This should cover most html/css/js issues. Issues that relate to the native app code (eg certain touch events) will need to be tested out with a device or simulator as below. 

Ideally Apps Rendering will be added to Preview so you can test out issues before a piece goes live - but there isn't a date for this yet. Until this happens, draft articles will need to be tested out using methods below. 

## Option 1: deploy and view on device with a preview link 
 
You need to have the Guardian app on a phone and access to composer.

1. Deploy the interactive
2. Embed it in a unpublished composer page 
3. Hit preview on composer 
4. In preview click “Get app preview link” in the menu bar at the top 
5. A link will have been sent to your email. Open this on a device with the Guardian app, it should open in the app and you can check how it works 

- ✅ works for final checks 
- ✅ closest to live environment
- ❌ no error messages - hard to debug
- ❌ feedback loop is slow, have to redeploy - trying out how things work



## Option 2: plug your physical device into the laptop, debug with Safari (apple) or Chrome (android)

1. Plug your physical device into your computer. Accept any software updates and you need to let the phone trust the computer 

2. Install a dev build of the Guardian app to your device (this will have a yellow not blue icon). Ideally you should be able to go to [https://builds.gutools.co.uk/](https://builds.gutools.co.uk/) and download the builds of the latest dev version. BUT - (as of March 2021) iOS link is no longer working from this page. Contact apps team can send this to you, if you give them your UDID - they can send it over as a zip file - .ipa file. This [guide can help you find your device's UDID](https://www.sourcefuse.com/blog/how-to-find-udid-in-the-new-iphone-xs-iphone-xr-and-iphone-xs-max/).

To install the build on your phone follow the 'using xcode' section in [these instructions](https://codeburst.io/latest-itunes-12-7-removed-the-apps-option-how-to-install-ipa-on-the-device-3c7d4a2bc788?gi=5439d1ba0757 )

3. Use the relevant browser to open and access the device's console logs (as above). You will need to [enable web inspector](https://www.wikihow.com/Use-Web-Inspector-on-an-iPhone) on an iPhone's Safari menu. 



- ✅ able to inspect and query the DOM, test out inspector changes and see errors in the console
- ✅ test actual touch gestures on a real device 
- ✅ (for iOS) don't need to keep updating your MacOS system 
- ❌ feedback loop is slow, have to redeploy when trying out how things work
- ❌ have to have the device



## Option 3A : use a simulator on your computer - iOS 

You still need to deploy and use a preview link, but can debug more easily with a Simulator 

1. Install Xcode. As a Mac user you can download and install Xcode for free from App Store - however you need an Apple account (If you want to use your device later it will help to use the same account you have on your device). You may need to upgrade to a more recent version of MacOS. (This is a reason to use a device if possible rather than a simulator - simulators require Xcode to be at a very recent version which means you constantly have to update your computer's MacOS.)

2. The iOS Simulator is part of XCode. Open Xcode and you should see an option to open the simulator

3. Install a dev build of the app to allow you debug access. Security settings on the actual Guardian app won't let you connect to a debugger. Go to the iOS app repo: [https://github.com/guardian/ios-live](https://github.com/guardian/ios-live), clone the repository and follow the Read.me instructions down to the end of "Your first build". The yellow dev version of the Guardian app should now be loaded on your Simulator home screen.

(Possible alternative: install a dev build from a .ipa file) Ideally you should be able to get the dev build from [https://builds.gutools.co.uk/](https://builds.gutools.co.uk/). BUT - (as of March 2021) iOS link is no longer working from this page. Contact apps team can send this to you, if you give them your UDID - they can send it over as a zip file - .ipa file. This [guide can help you find your device's UDID](https://www.sourcefuse.com/blog/how-to-find-udid-in-the-new-iphone-xs-iphone-xr-and-iphone-xs-max/). To use an .ipa file on a simulator - you need to build the .ipa (takes about an hour) then can run this on your simulator. [More information here.](https://stackoverflow.com/questions/517463/how-can-i-install-a-ipa-file-to-my-iphone-simulator#:~:text=You%20cannot%20run%20an%20ipa,the%20simulator%20on%20their%20machine)
.

4. Get a preview link as above and paste it into the browser on your device or inside the simulator and it will ask to open in the app. You should be able to see your page in the app.

5. Once you have the page open, you can debug by opening Safari on your laptop and selecting your simulator to open a debugging window. If you don't see an option to connect to the Simulator you may need to install Safari Technology Preview (a version of the browser optimised for developers). 

**Safari > Develop > Simulator - Device name - iOS version > Automatically show Web Inspector for JSContexts** 

Select the article’s app view and you should see the article’s preview and the dom tree in a safari window. From here you should be able to inspect and even modify the dom to see what a change would look like. You will still need to deploy the atoms and reopen the app’s link to see the new changes come through (there is no localhost/hot reload functionality).


- ✅ able to inspect and query the DOM, test out inspector changes and see errors in the console
- ✅ don’t need a device
- ✅ can check different simulated devices
- ❌ feedback loop is slow, have to redeploy when trying out how things work
- ❌ your MacOS needs to be kept at the latest or next to latest version





## Option 3B: use a simulator on your computer - Android 

Instructions [with pictures here](https://docs.google.com/document/d/18XaqGm_A6kQGIjTz7adHwwUJ6vY6l_DOkAevasi95UU/edit). 

1. Download and install Android studio: [https://developer.android.com/studio](https://developer.android.com/studio)

2. Go to [https://builds.gutools.co.uk](https://builds.gutools.co.uk) and click "install build" under Android - it will download to your downloads folder. (note you may have to be within the developers' VPN to do this, but getting there is less bother than you may think, and you can do it with your login for the editorial VPN. Ask Sean how).

3. Open Android studio and go to File > Profile or debug APK. Then, in the next dialogue box, choose the APK you just downloaded.

4. Choose what device you want to emulate it on. This happens in a box in the top middle-right of the window. There may be a default but if you open the AVD manager you'll get the option to set up various types of emulated devices, so you can see what it looks like on a tablet as well as a phone. Once you've chosen a device, hit the green button to run the app on that device. The emulator will spring up in a new window. At this point you will have to sign in and get preview keys in the same way that you would do with a physical test device. 

5. Now open chrome and go to:  chrome://inspect/#devices You should see a list under the title "Remote Targets". If you click 'inspect' under the first entry in that list ("Article") you should be in the familiar chrome devtools environment and able to see console logs or inspect elements and styles.


- ✅ able to inspect and query the DOM, test out inspector changes and see errors in the console
- ✅ don’t need a device
- ✅ can check different simulated devices
- ❌ feedback loop is slow, have to redeploy when trying out how things work






## Side note: 
### Mobile browser testing options

- With a simulator or a device connected to your computer you can open a localhost link in the phone browser and view the debug console 

- Using a portforwarding tool so you can “deploy” (or forward) your localhost to a url that can then be opened on a phone browser 


