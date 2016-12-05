  const trailIcon = {
      url: "http://maps.google.com/mapfiles/ms/icons/red.png",
      // size: new google.maps.Size(9, 9),
      // origin: new google.maps.Point(0,0),
      // anchor: new google.maps.Point(5,5)
  };

  const pointIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue.png"
  }
  const savedIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/green.png"
  }


var icons = {
	blaze: trailIcon,
	pointUnsaved: pointIcon,
	pointSaved: savedIcon
}

export { icons }