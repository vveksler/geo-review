import ymaps from "ymaps";
import ymapsClass from "./common/ymapsClass.js";
import { resizeHendler } from "./common/utils";

ymaps
  .load(
    "https://api-maps.yandex.ru/2.1/?apikey=ed90bb2b-d871-4a75-b697-bf6db27c4a91&lang=en_US"
  )
  .then((maps) => {
    const myMap = new maps.Map(
      "map",
      {
        center: [31.523316, 34.602904], // Israel, Sderot
        zoom: 16,
        controls: [],
        lang: "IL",
      },
      {
        searchControlProvider: "yandex#search",
      }
    );

    const ymap = new ymapsClass(myMap);

    ymap.addAllPoints();

    // event listeners
    myMap.events.add("click", function (e) {
      const coords = e.get("coords");

      ymap.map.balloon.close();
      ymap.overlay.open(e._sourceEvent._sourceEvent);
      ymap.overlay.setContent("Searching...");
      document.querySelector(".overlay__desc").innerHTML = "No comments yet...";

      ymap.getAddress(coords).then((res) => {
        ymap.overlay.setContent(res, coords);
      });
    });

    ymap.clasterer.events.add("balloonopen", () => {
      const overlayElement = document.querySelector(".overlay");

      if (overlayElement) {
        ymap.overlay.close();
      }
    });

    window.addEventListener("resize", resizeHendler);
  })
  .catch((error) => console.log("Failed to load Yandex Maps", error));
