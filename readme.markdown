# exterminate

terminal emulator application like xterm

# example

Just type `exterminate`. You will be in a graphical shell just like xterm or
gnome-terminal, except running with chrome using `--app`.

To render html pages and images inline in the terminal use the `xtshow`
command:

![exterminate](http://substack.net/images/screenshots/exterminate.png)

# usage

```
usage:

  exterminate OPTIONS
  
    Create an exterminate session or server.
    
    OPTIONS:
    
      --port=PORT   Listen on 0.0.0.0:PORT and go into server mode.
      
      --viewer      Broadcast the first connection to all later connections.
      
      --app=CMD     Command to launch `google-chrome` as or false to not launch.

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
