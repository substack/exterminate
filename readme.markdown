# exterminate

terminal emulator application like xterm

# example

Just type `exterminate`. You will be in a graphical shell just like xterm or
gnome-terminal, except running with chrome using `--app`.

To render html pages and images inline in the terminal use the `xtshow`
command:

![exterminate](http://substack.net/images/screenshots/exterminate.png)

You can render any html you want on the terminal! Here's some javascript and
html that parses the query string and renders it... in comic sans!

``` js
var qs = require('querystring');

var params = qs.parse(window.location.search.replace(/^\?/, ''));
var text = document.createTextNode(JSON.stringify(params));
document.body.appendChild(text);
```

``` html
<html>
<head>
<style>
  body {
    font-family: "Comic Sans MS";
    color: rgb(100,255,255);
    font-size: 1.5em;
  }
</style>
</head>
<body>
<script src="bundle.js"></script>
</body>
</html>
```

```
$ browserify main.js > bundle.js
```

![comic sans in the terminal](http://substack.net/images/screenshots/exterminate_comic_sans.png)

# usage

```
usage:

  exterminate OPTIONS
  
    Create an exterminate session or server.
    
    OPTIONS:
    
      --port=PORT   Listen on 0.0.0.0:PORT and go into server mode.
      
      --viewer      Broadcast the first connection to all later connections.
      
      --share       Share a terminal with anybody who connects.
      
      --share=N     Limit sharing to the first N connections.
      
      --app=CMD     Command to launch `google-chrome` as or false to not launch.
      
      --shell=CMD   Command used for the shell by exterminate. Defaults to
                    $SHELL and falls back to `bash`.

  exterminate show FILE
  
    Render the html, image, or text content at FILE inline in the terminal.
    
    This command is also available as `xtshow`.

```

# install

First install google chrome ane make sure `google-chrome` is in your `$PATH`.

Then with [npm](https://npmjs.org) do:

```
npm install -g exterminate
```

# license

MIT
