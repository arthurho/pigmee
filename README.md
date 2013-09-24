A web application that allows users to play ping pong using their phone's accelerometer. Developed by Arthur Hong.

Uses websockets to create communication channels between phone and desktop computer, where the ping pong table is displayed. Graphics are drawn using HTML5 Canvas and javascript.

To play, install the following modules:
npm install express
npm install passport
npm install passport-local (for simple username and passport authentication)
npm install socket.io
npm install connect-flash

App listens to port 8889

node simpleExpressServer.js to run the game

direct your phone to static/simpleClient.html

Left user login username: 'leftPlayer' password: 'secret'
Right user login username: 'rightPlayer' password: 'secret'

direct desktop browser to static/browser.html

Have fun :)