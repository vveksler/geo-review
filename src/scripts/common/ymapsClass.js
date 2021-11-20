import { setPosition, dragAndDrop } from "./utils";
import moment from "moment";

const template = document.querySelector("#overlayTemplate").innerHTML;
export default class {
  constructor(map) {
    this.map = map;
    /* eslint-disable */
    this.customItemContentLayout = ymaps.templateLayoutFactory.createClass(
      /* eslint-enable */
      "<div class=ballon_header>{{ properties.balloonContentHeader|raw }}</div>" +
        "<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>" +
        "<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>"
    );
    /* eslint-disable */
    this.clasterer = new ymaps.Clusterer({
      /* eslint-enable */
      preset: "islands#invertedVioletClusterIcons",
      clusterDisableClickZoom: true,
      clusterOpenBalloonOnClick: true,
      clusterBalloonContentLayout: "cluster#balloonCarousel",
      clusterBalloonItemContentLayout: this.customItemContentLayout,
      clusterBalloonPanelMaxMapArea: 0,
      clusterBalloonContentLayoutWidth: 250,
      clusterBalloonContentLayoutHeight: 130,
      clusterBalloonPagerSize: 5,
      hideIconOnBalloonOpen: false,
      balloonOffset: [0, -25],
    });

    this.overlay = this.createOverlay(template);
  }

  createPlacemark(coords, data) {
    /* eslint-disable */
    return new ymaps.Placemark(coords.split(","), data, {
      /* eslint-enable */
      balloonShadow: false,
      hideIconOnBalloonOpen: false,
      preset: "islands#violetIcon",
      hasBalloon: false,
    });
  }

  getAddress(coords) {
    /* eslint-disable */
    return new ymaps.geocode(coords).then((res) =>
      /* eslint-enable */
      res.geoObjects.get(0).getAddressLine()
    );
  }

  getCommentsOnAddress(address) {
    const OverlayText = document.querySelector(".overlay__desc");

    fetch("/get/" + encodeURIComponent(address), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then((res) => {
      res.text().then((res) => {
        if (res === '<ul id="commentsList"></ul>') {
          OverlayText.innerHTML = "No comments yet...";
        } else {
          OverlayText.innerHTML = res;
        }
      });
    });
  }

  addAllPoints() {
    const geoObjects = [];

    this.clasterer.removeAll();
    fetch("/get/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        res.forEach((point) => {
          const newPlacemark = this.createPlacemark(point.coords, {
            balloonContentHeader: point.place,
            balloonContentBody:
              '<a href="" id="open-popup" data-coords="' +
              point.coords +
              '">' +
              point.address +
              "</a>" +
              "<p>" +
              point.text +
              "</p>",
            balloonContentFooter:
              "<p>" + moment(point.date).format("DD.MM.YYYY hh:mm:ss") + "</p>",
          });

          newPlacemark.events.add("click", (e) => {
            const coords = e.originalEvent.target.geometry._coordinates;

            this.overlay.open(e.originalEvent.domEvent);
            this.overlay.setContent("Searching...");
            document.querySelector(".overlay__desc").textContent = "Loading...";
            this.openOverlay(coords);

            this.getAddress(coords).then((res) => {
              this.overlay.setContent(res, coords);
            });
          });

          geoObjects.push(newPlacemark);
        });

        return geoObjects;
      })
      .then((geoObjects) => {
        this.clasterer.add(geoObjects);
        this.map.geoObjects.add(this.clasterer);
      });
  }

  addComment(overlay) {
    return (e) => {
      e.preventDefault();

      const address = overlay.querySelector(".overlay__title");
      const name = overlay.querySelector("#name").value;
      const place = overlay.querySelector("#place").value;
      const text = overlay.querySelector("#text").value;
      const form = overlay.querySelector("#form");
      const coords = address.dataset.coords;

      if (name && place && text) {
        fetch("/add", {
          method: "POST",
          body: JSON.stringify({
            address: address.innerText,
            coords,
            name,
            place,
            text,
          }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }).then(() => {
          this.getCommentsOnAddress(address.innerText);
          this.addAllPoints();
        });

        form.reset();
      }
    };
  }

  createOverlay(template) {
    let fragment = document.createElement("div");
    fragment.innerHTML = template;
    const overlayElement = fragment.querySelector(".overlay");
    const titleElement = fragment.querySelector(".overlay__title");
    const contentElement = fragment.querySelector(".overlay__desc");
    const formElement = fragment.querySelector("#form");
    const closeOverlay = fragment.querySelector(".overlay__close");
    fragment = null;

    document.addEventListener("click", (e) => {
      if (e.target.id === "open-popup") {
        e.preventDefault();

        this.openOverlay(e.target.dataset.coords.split(",")); // openOverlay
        contentElement.innerHTML = "Loading...";
        setPosition(e, overlayElement); // setPosition
      }
    });

    overlayElement.addEventListener("mousedown", dragAndDrop(overlayElement));

    formElement.addEventListener("submit", this.addComment(overlayElement));

    closeOverlay.addEventListener("click", () => {
      document.body.removeChild(overlayElement);
    });

    return {
      open({ originalEvent }) {
        formElement.reset();
        document.body.appendChild(overlayElement);

        if (originalEvent) {
          setPosition(originalEvent, overlayElement);
        }
      },
      close() {
        closeOverlay.click();
      },
      setContent(content, coords) {
        if (content === undefined || content === "") {
          titleElement.innerHTML = "Unknown place...";
        } else {
          titleElement.innerHTML = content;
        }
        if (coords !== undefined) {
          titleElement.dataset.coords = coords;
        }
      },
    };
  }

  openOverlay(coords) {
    this.map.balloon.close();
    this.overlay.open({});
    this.overlay.setContent("Searching...", coords);

    this.getAddress(coords).then((res) => {
      this.overlay.setContent(res);
      this.getCommentsOnAddress(res);
    });
  }
}
