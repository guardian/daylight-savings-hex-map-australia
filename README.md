### Running locally

You need the gulp-cli installed globally: `npm install -g gulp-cli`

Make sure you are using the correct version of node with NVM: run `nvm use` in the root of the repo. 
If you don't have nvm installed, add it: `brew install nvm`.

Install node modules: `npm i`

To run locally: `npm start` or `gulp`.  


### Deploy to S3

Fill out config.json:

```
{
    "title": "Title of your interactive",
    "docData": "Any associated external data",
    "path": "year/month/unique-title"
}
```

Deploy: `gulp deploylive`

Get the deployed links: `gulp url`

The link can be pasted into a Composer file 


### Create a new atom 

Duplicate an existing atom. Remember to change the path in the server/render.js file to point to the html file in the new atom. 


### Loading resources (e.g. assets)

Resources must be loaded with absolute paths, otherwise they won't work when deployed.
Use the template string `<%= path %>` in any CSS, HTML or JS, it will be replaced
with the correct absolute path.

```html
<img src="<%= path %>/assets/image.png" />
```

```css
.test {
    background-image: url('<%= path %>/assets/image.png');
}
```

```js
var url = '<%= path %>/assets/image.png';
```


### Using the ScrollyTeller module
The ScrollyTeller module is written as a class. You can check the scrollyteller-example branch for a full example.

Import it as normal into your project
```
import ScrollyTeller from "./scrollyteller"
```

Instantiate a new instance of it and pass in a config object
```
const scrolly = new ScrollyTeller({
    parent: document.querySelector("#scrolly-1"),
    triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: true
});
```

Add your trigger points:
```
scrolly.addTrigger({num: 1, do: () => {
    console.log("Console log 1");
}});
```

And finally start off the scroll listener:

```
scrolly.watchScroll();
```

You'll also need to comment in the _scrolly.scss code in main.scss, as well as structuring your HTML in the following way:
```
<div id="scrolly-1">
    <div class="scroll-wrapper">
        <div class="scroll-inner">
            <svg id="data-viz">
            </svg>
        </div>
        <div class="scroll-text">
            <div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <p>1</p>
                </div>
            </div>
            <div class="scroll-text__inner">
                <div class="scroll-text__div"> 
                    <p>2</p>
                </div>
            </div>
            <div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <p>3</p>
                </div>
            </div>
        </div>
    </div>
</div>
```







