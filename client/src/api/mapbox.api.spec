http://{s}.somedomain.com/blabla/{z}/{x}/{y}.png

http://api.mapbox.com/v4/{map_id}/{z}/{x}/{y}.png?access_token={apikey}

GET http://api.mapbox.com/v4/{map_id}/{z}/{x}/{y}{highDPI}.{format}?access_token={apikey}

https://api.mapbox.com/v4/mapbox.light/1/2/3.png?access_token=pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q

{
    map_id: 'mapbox.satellite',
    {z}: ,
    {x}: ,
    {y}: ,
    '@2x': highDPI ? '@2x' : '',
    apikey: apikey
}


'.light'
'.dark'
'.outdoors'
'.emerald'
'.high-contrast'


// assuming your map is the variable map
var credits = L.control.attribution().addTo(map);
credits.addAttribution("© <a href='https://www.mapbox.com/map-feedback/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>");

https://api.mapbox.com/v4/mapbox.streets/1/0/0.png?access_token=pk.eyJ1IjoiY2FsYW1pdGl6ZXIiLCJhIjoiY2lxaTQzcm5iMDVoemZ5bnB6NXdpYnVlNyJ9.HGpHUJPiNRP75L5SaCZV5Q
