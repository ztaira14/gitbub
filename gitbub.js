// Made in d3 v4
// Inspiration taken heavily from:
// Cluster Force Layout
// http://bl.ocks.org/mbostock/7882658
// Github visualizer in d3
// http://ghv.artzub.com/#user=ztaira14
// Graph with tooltips
// https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73

function listener () {
  console.log("Recieved githubAPI response");
  localStorage.setItem("githubAPI_response", this.response);
  displayd3();
}

function displayd3 () {
  // get github stuff out of local storage
  var githubStuff = JSON.parse(localStorage.getItem("githubAPI_response"));
  var numberOfNodes = githubStuff.length;

  // width of svg
  var width = window.innerWidth * 0.75,
    // height of svg element
    height = window.innerHeight * 0.75;

  // label the languages with a numerical ID to sort by
  var languageIndex = {}, clusterNum = 0;
  for (i = 0; i < numberOfNodes; i++) {
    if (!(languageIndex.hasOwnProperty(githubStuff[i].language))) {
      languageIndex[githubStuff[i].language] = clusterNum;
      languageIndex[clusterNum] = githubStuff[i].language;
      clusterNum++;
    }
  }

  // create nodes
  var nodes = new Array(numberOfNodes);
  for (i = 0; i < numberOfNodes; i++) {
    nodes[i] = {
      "size": githubStuff[i].size,
      "language": languageIndex[githubStuff[i].language],
      "name": githubStuff[i].name
    };
  }
  console.log(nodes);
  // create color scale
  var colors = d3.schemeCategory20;

  // function to set the charge strength
  function chargeStrength(d) {
    return ((3.141*(nodeSize(d)*nodeSize(d)))/500);
  }
  // function to set the collision radius
  function nodeSize(d) {
    return 12+3*Math.log(d.size);
  }
  // create a force simulation with the nodes
  var forceSim = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(chargeStrength))
    .force("collide", d3.forceCollide(nodeSize).strength(1).iterations(3))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaDecay(0);

  // create the tooltip text
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("-webkit-user-select", "none")
    .style("-moz-user-select", "none")
    .style("-ms-user-select", "none")
    .html("Hello World");

  // create the svg
  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  // what to do when a node is dragged
  function dragstarted(d) {
    if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function dragended(d) {
    if (!d3.event.active) forceSim.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  // create the nodes in the svg
  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    // the color of each node
    .style("fill", function(d) { return colors[d.language]; })
    // the size of each node
    .attr("r", nodeSize)
    // functions to call when dragged
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    // show the tooltip on mouseover
    .on("mouseenter", function (d) {
      div.transition()
        .duration(200)
        .style("opacity", 0.8);
      div.html("Name: " + d.name + "<br>Size: " + d.size + "<br>Language: " + languageIndex[d.language])
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    // hide the tooltip on mouseleave
    .on("mouseleave", function (d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    // when clicked, open the repository the node represents
    .on("click", function (d) {
      ztairaGithub = "https://github.com/ztaira14/";
      d3.event.stopPropagation();
      window.open(ztairaGithub + d.name);
    });

  // create the node labels
  var text = svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("dy", function(d) { return "4px"; } )
    .text(function(d) { return d.size; } )
    .style("-webkit-user-select", "none")
    .style("-moz-user-select", "none")
    .style("-ms-user-select", "none")
    // show the tooltip on mouseover
    .on("mouseenter", function (d) {
      div.transition()
        .duration(200)
        .style("opacity", 0.8);
      div.html("Name: " + d.name + "<br>Size: " + d.size + "<br>Language: " + languageIndex[d.language])
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    // hide the tooltip on mouseleave
    .on("mouseleave", function (d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .attr("text-anchor", "middle");

  // create the key
  for (i = 0; i < clusterNum; i++) {
    var language;
    if (languageIndex[i] === null) {
      language = 'null';
    } else {
      language = languageIndex[i];
    }
    d3.select(".key").append("span")
      .html(language)
      .attr("class", "title")
      .style("margin", "0px")
      .style("border", "0px")
      .style("background", colors[i])
      .style("text-align", "center")
      .style("font-size", "16px")
      .style("color", "black");
  }

  // tick function
  forceSim.on("tick",
    function tick(e) {
      node
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      text
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
  );
}

// Set the base URL for now
var baseURL = "https://api.github.com/users/ztaira14/repos";

// Construct XMLHttpRequest and send it, store the result in localstorage
var githubAPI = new XMLHttpRequest();
githubAPI.open("GET", baseURL);
githubAPI.addEventListener("load", listener);
githubAPI.send();

console.log("Sent githubAPI request");
