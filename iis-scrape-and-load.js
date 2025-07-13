/*
  Intended to be ran client side. Setup a directory under IIS with directory listing enabled and pass the path into addFilesToPage
  loadFile can be used with arbitrary content, feed it the url and mime type
  fileTypeTest is a type map function that allows you to test a file extension via regex and assign its mime-type accordingly and then passes it through the loadFile function so it can be viewed without leaving the page
  listener is a function used to remove the viewer modal if it's closed/clicked out of
*/

function loadFile(file, type) {
  resourceContainer = document.createElement("div");
  resourceBody = document.createElement("div");
  resource = document.createElement("object");
  title = document.createElement("p");
  resourceClose = document.createElement("a");
  resource.type = type;
  resource.data = file;
  document.body.appendChild(resourceContainer);
  resourceContainer.appendChild(resourceClose);
  resourceContainer.appendChild(title);
  resourceContainer.appendChild(resourceBody);
  title.innerHTML = file;
  resourceClose.innerHTML = "X";
  resourceContainer.className = "file";
  resourceClose.className = "close";
  title.className = "title";
  resourceBody.className = "filebody";
  resourceBody.appendChild(resource);
  document.addEventListener("click", listener, true);
  document.getElementById("overlay-back").style.display = "block";
}

function listener(event) {
  var isClickInside = resourceContainer.contains(event.target);
  var closeClicked = resourceClose.contains(event.target);
  if (!isClickInside || closeClicked) {
    document.body.removeChild(resourceContainer);
    resourceContainer = undefined;
    resource = undefined;
    document.removeEventListener("click", listener, true);
    document.getElementById("overlay-back").style.display = "none";
  }
}

function fileTypeTest(fileElement) {
  let typeMap = {
    "application/pdf": /.*\.pdf/,
    "video/mp4": /.*\.mp4/,
  };
  for (type in typeMap) {
    if (typeMap[type].test(fileElement.href)) {
      fileElement.setAttribute("file", fileElement.href);
      fileElement.onclick = function() {
        loadFile(this.getAttribute("file"), type);
      };
      fileElement.href = "#";
      return fileElement;
    }
  }
  return fileElement;
}

async function addFilesToPage(file, node, name) {
  let files = new Array();
  const pdfCheck = /.*\.pdf/;
  const parser = new DOMParser();
  let html = await fetch(file).then((r) => r.text());
  const listing = parser.parseFromString(html, "text/html");
  const links = listing.getElementsByTagName("a");
  for (let x = 0; x < links.length; x++) {
    if (links[x].innerText.includes("Parent Directory")) continue;
    files.push(fileTypeTest(links[x]));
  }
  if (files.length == 0) return;
  const header = document.createElement("h2");
  header.innerText = name;
  nodeDOM = document.getElementById(node);
  nodeDOM.append(header);
  for (let x = 0; x < files.length; x++) {
    nodeDOM.append(files[x]);
    nodeDOM.append(document.createElement("br"));
  }
}
