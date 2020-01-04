$(function() {

    var then = new Date(2019, 07, 24), // month is zero based
        now = new Date; // no arguments -> current date

    // 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
    var dni = Math.round((now - then) / (1000 * 60 * 60 * 24)); // round the amount of days
    // result: 712

    document.getElementById('userMsg2').textContent = 'Asiu jesteś dla mnie taką osobą już od ' + dni + ' dni.';

    // shaffle text
    jQuery.fn.extend({
        shuffleEffect: function(duration) {
            if (duration == null) duration = 50;
            var arrLetter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            var $this = jQuery(this);
            var strDefault = $this.text();
            var nLength = strDefault.length - 1;
            var i = 0;
            var strText = "";
            var tid = setInterval(function() {
                if (i < nLength + 1) {
                    var strShuffle = "";
                    //                for(var j=0; j<nLength-i; j++){
                    var slicedText = strDefault.slice(i, nLength);
                    var term = slicedText.split(' ');
                    for (var j = 0; j < term[0].length - 1; j++) {
                        strShuffle += arrLetter[Math.floor(Math.random() * arrLetter.length)];
                    }
                    strText += strDefault.charAt(i);
                    //              $this.css({display:"block"}).text(strText + strShuffle);
                    $this.css({
                        display: "block"
                    }).html(strText + "<span class='rand_text'>" + strShuffle + "</span>");
                    i++;
                } else {
                    clearInterval(tid);
                }
            }, duration);
        }
    });

    $('.shuffle_text').shuffleEffect(40);
})