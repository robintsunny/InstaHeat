function refugees(type, targetYear) {
  const width = 2000,
    height = 700;

  let inputFile;
  if (type === "origin") {
    inputFile = "./data/origin.csv";
  } else if (type === "asylum") {
    inputFile = "./data/asylum.csv";
  }

  console.log(inputFile);

  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0" + width / 2 + " " + height / 2)
    .attr("class", "svg-container")
    .append("g")
    // .attr("transform", "translate(0,0)");
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  //      ==> this will set the initial setup at the center

  var defs = svg.append("defs");

  d3.csv(inputFile, function(data) {
    /////////////////////////////////////////////////////////////////////////////
    ////////////////                SORT DATA                  //////////////////
    /////////////////////////////////////////////////////////////////////////////
    data = data.sort((b, a) => {
      return a[targetYear] - b[targetYear];
    });

    /////////////////////////////////////////////////////////////////////////////
    ////////////////               CREATE SCALE                //////////////////
    /////////////////////////////////////////////////////////////////////////////

    var scale = d3
      .scaleSqrt()
      // .linear()
      .domain([0, 5000000])
      .range([0, 120]);

    /////////////////////////////////////////////////////////////////////////////
    ////////////////              CREATE FLAG IMG              //////////////////
    /////////////////////////////////////////////////////////////////////////////
    defs
      .selectAll(".flag-pattern")
      .data(data)
      .enter()
      .append("pattern")
      .attr("class", "flag-pattern")
      .attr("id", d => {
        return d.code;
      })
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("height", "1")
      .attr("width", "1")
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", d => {
        return d.imagePath;
      });

    /////////////////////////////////////////////////////////////////////////////
    ////////////////              CREATE CIRCLES               //////////////////
    /////////////////////////////////////////////////////////////////////////////
    var circle = svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circley")
      .attr("cx", d => {
        if (d[targetYear] !== 0) {
          return scale(d[targetYear]);
        }
      })
      .attr("cy", d => {
        if (d[targetYear] !== 0) {
          return scale(d[targetYear]);
        }
      })
      .attr("r", d => {
        if (d[targetYear] !== 0) {
          return scale(d[targetYear]);
        }
      })
      .attr("fill", d => {
        return "url(#" + d.code + ")";
      })
      .attr("stroke", "white")
      .attr("fill-opacity", 0.7)
      // .on("mouseover", function(d) {
      //   d3.select(this)
      //     .attr("fill-opacity", 1)
      //     .append("text")
      //     .attr("class", "text-code")
      //     .text(d.code);
      //   console.log(d);
      // })
      .on("mouseover", function(d) {
        console.log(d);
        let actionType;
        if (type === "asylum") {
          actionType = "came to";
        } else {
          actionType = "left";
        }
        d3.select(this).attr("fill-opacity", 1);
        d3.select(".infobox .ccc").text(d.code);
        d3.select(".infobox .yyy").text(
          "In " +
            String(targetYear) +
            ", " +
            String(d[targetYear].toLocaleString()) +
            " refugees " +
            actionType +
            " " +
            String(d.country)
        );
        d3.select(".infobox").style("visibility", "visible");
      })
      .on("mouseout", function(d) {
        d3.select(".infobox").style("visibility", "hidden");
        d3.select(this).attr("fill-opacity", 0.5);
      });

    /////////////////////////////////////////////////////////////////////////////
    ////////////////           CHANGE YEAR OR ASY-ORI          //////////////////
    /////////////////////////////////////////////////////////////////////////////
    AO = type;
    yr = targetYear;

    d3.select("#year").on("change", function() {
      yr = eval(d3.select(this).property("value"));
      svg.selectAll("circle").remove();
      refugees(AO, yr);
    });

    d3.select("#AO").on("change", function() {
      AO = String(eval(d3.select(this).property("value")));
      svg.selectAll("circle").remove();
      refugees(AO, yr);
    });

    /////////////////////////////////////////////////////////////////////////////
    ////////////////          SEPARATE BY CONTINENT            //////////////////
    /////////////////////////////////////////////////////////////////////////////
    d3.select("#continent").on("click", () => {
      simulation
        .force("x", forceXSplit)
        .alphaTarget(0.5)
        .restart();
    });
    d3.select("#combine").on("click", () => {
      simulation
        .force("x", forceXCombine)
        .alphaTarget(0.1)
        .restart();
    });

    var forceXCombine = d3.forceX().strength(0.05);

    var forceY = d3.forceY().strength(0.05);

    var forceCollide = d3
      .forceCollide(d => {
        return scale(d[targetYear]);
      })
      .strength(0.99);

    var simulation = d3
      .forceSimulation()
      .force("x", forceXCombine)
      // .force("x", d3.forceX(width/2).strength(0.05)) ==> width/2 if translate is (0,0)
      .force("y", forceY)
      .force("collide", forceCollide);

    simulation.nodes(data).on("tick", ticked);

    function ticked() {
      circle
        .attr("cx", d => {
          return d.x;
        })
        .attr("cy", d => {
          return d.y;
        });
    }

    var forceXSplit = d3
      .forceX(d => {
        if (d.continent === "NA") {
          return -(width * 3) / 7;
        } else if (d.continent === "SA") {
          return (width * -2) / 7;
        } else if (d.continent === "EU") {
          return (width * -1) / 7;
        } else if (d.continent === "AF") {
          return 0;
        } else if (d.continent === "AU") {
          return (width * 1) / 7;
        } else if (d.continent === "AS") {
          return (width * 2) / 7;
        } else if (d.continent === "OC") {
          return (width * 3) / 7;
        }
      })
      .strength(0.1);
  });
}

refugees("asylum", 2016);
