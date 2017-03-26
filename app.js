var request = require('superagent');
var fs = require('fs');

function getTrueRoomID() {
    request.get("http://www.pixiv.net/member.php?id=4364687")
        .timeout(3000)
        .end(function(err, res) {
            if (err) {
                console.log("Error!");
            }

            // console.log(res.text);

            fs.writeFile('./test.html', res.text, function(err) {
                if (err) {
                    console.log("Error!");
                }
                console.log('Saved.');
            });

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        })
}

getTrueRoomID();