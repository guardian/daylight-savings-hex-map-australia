# Getting interactives to work with dark mode in apps 

If a user is viewing the Guardian app in "dark mode", by default, interactive atoms and chart atoms will get a white background applied to them. This makes sure that the default black text is visible on dark mode. 

However, a white background can look bad on some interactives. For interactives where design is more important, you may want to override the white background with a transparent one and add specific CSS styles for dark mode. 

NB: This guide will work for app pages rendered through the new [Apps Rendering](https://github.com/guardian/apps-rendering/tree/2436d412831ff14a0709b1813fd0421c95eb3663) platform. By April 2021 this should be the majority of pages, though users may need to update their apps to see the effects. 

## Where the white background is set 

The Apps-Rendering platform CSS reaches into the iframe that hosts the interactive and sets the `background-color` of the `body` to white. [Code here](https://github.com/guardian/apps-rendering/blob/2436d412831ff14a0709b1813fd0421c95eb3663/src/components/atoms/interactiveAtom.tsx#L37).

You can view this in action by opening a published page in your computer browser in the apps-rendering view: 

**Guardian article > Teleporter > apps-rendering**

Inspect the body element of the iframe that hosts your interactive. 

## Viewing dark mode on your computer

The background-color attribute is set behind a dark-mode media query so you will only see this in Inspector if you have set your browser or Macbook to dark mode. 

To do this on your Mac go to:

**System Preferences > General > Appearance > Dark**

The apps-rendering page should now be in dark-mode and you should be able to see that all atoms have the default white background. 


## Overriding the white background and adding dark-mode styles 

Your interactives CSS needs to set the `background-color` of the `body` more forcibly than the Apps-Rendering CSS. You will need to use something like:

```
@media (prefers-color-scheme: dark) {
        body {
            background: transparent !important;
        } 
    }
```

You can add a class or id to the body if you need to make the CSS more specific.

While you are there, you will also need to add dark mode styles - making sure that text defaults to white so it is visible: 

```
@media (prefers-color-scheme: dark) {
        h1, h2, p, span {
            color: white;
        }
        text {
            fill: white; 
        }
    }`;
```
