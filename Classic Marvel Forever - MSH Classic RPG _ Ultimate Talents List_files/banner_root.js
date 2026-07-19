<!-- Begin
var url='http://www.classicmarvelforever.com/';
var path = 'assets/templates/cmf_default/images/banners/';
var banner = 'banner1.gif';
var width='468';
var height='59';
var alt='Go to the Homepage';
var how_many_ads = 5;
var now = new Date();
var sec = now.getSeconds();
var ad = sec % how_many_ads;
ad +=1;
if (ad==1) {
banner="banner1.gif";
}
if (ad==2) {
banner="banner2.jpg";
}
if (ad==3) {
banner="banner3.jpg";
}
if (ad==4) {
banner="banner4.gif";
}
if (ad==5) {
banner="banner5.gif";
}

document.write('<div class=\"banner\"><a style=\"font-size:0px\" href=\"' + url + '\" target=\"_top\"><img src=\"' + path + banner + '\" width = ' + width + ' height=' + height + ' alt=\"' + alt + '\" border=\"0\"></div>');
// End -->