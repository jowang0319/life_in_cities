(function() {
    var margin = { top: 0, left: 50, right: 80, bottom: 50},
    height = 700 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

  // What is this???
  var svg = d3.select("#graphic")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var defs = svg.append("defs")

  var xPositionScale = d3.scaleLinear()
    .range([0,width-100]);

  var yPositionScale = d3.scaleBand()
    .range([height-200,25])
    .padding(0.2);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      // console.log(d)
      return "<span style='color:white'>" + d.City + "</span>";
    })

  svg.call(tip);

  defs.append("marker")
        .attr("id","arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 39)
        // .attr("refY", 0)
        .attr("refY", -2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

  var radiusScale = d3.scaleSqrt().range([10, 80])

  var circleYPositionScale = d3.scalePoint()
      .domain(['Amsterdam','Berlin','Bogota','Brussels','Buenos Aires',
        'Dubai','Edinburgh','Hong Kong','Istanbul','Johannesburg','London',
        'Los Angeles','Madrid','Melbourne','Montreal','Moscow'
        ,'Mumbai','New York','Paris','Rio de Janeiro','Rome','San Francisco',
        'San Paulo','Seoul','Shanghai','Shenzhen','Singapore','Stockholm',
        'Sydney','Taipei','Tokyo','Toronto','Vienna','Warsaw'
        ])
      .range([height-margin.bottom,margin.top])

  var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .alphaTarget(0.25)
    .force("collide", d3.forceCollide(function(d) {

      return radiusScale(d.population) + 5
    }))

            // simulation
        //   .force("x", d3.forceX(width / 2)
        //   .strength(0.1))
        //   .alphaTarget(0.25)
        //   .restart()

  d3.select('button#theaters').classed('selected',true)

  d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "data_nocountry.csv",function(d){
      d.population = +d.population
      d.theaters = +d.theaters
      d.art_galleries = +d.art_galleries
      d.michelin_rest = +d.michelin_rest
      d.inter_student = +d.inter_student
      d.bar = +d.bar
      d.inter_tourists = +d.inter_tourists
      d.cinAd_perc = +d.cinAd_perc
      d.club_disco = +d.club_disco
      d.bookshop = +d.bookshop
      d.green = +d.green
      d.cinema = +d.cinema
      d.film_fes = +d.film_fes
      d.foreign_born = +d.foreign_born
      d.concer_hall = +d.concer_hall
      d.dance_performance=+d.dance_performance
      return d
    })
    .await(ready) 

  var projection = d3.geoMercator()
    .translate([ width / 2.1, height / 2.1])
    .scale(110);

  var path = d3.geoPath()
    .projection(projection);

  function ready(error, jsondata,datapoints) {

    console.log(jsondata)

    popExt = d3.extent(datapoints,function(d){
      return d.population
    })

    var city_selected = "Shanghai"

    yPositionScale.domain(datapoints.map(function(d){ return d.City; }))

    var selected = "theaters"

    selectExt = d3.extent(datapoints,function(d){
      return d[selected]
    })

    // console.log(popExt)

    radiusScale.domain(popExt)

    var city_bars = svg.selectAll('.bar')
      .data(datapoints)
      .enter().append("rect")
      .attr("class", "bar")
      .attr('x',function(d){
        var coords = projection([d.longitude, d.latitude])
        return coords[0]
      })
      .attr("y", function(d) {
        var coords = projection([d.longitude, d.latitude])
        return coords[1]
      })
      .attr('width',4)
      .attr('height',4)
      .attr('fill','#FBE251')
      .attr('opacity',0)
      .attr('display','none')
      .attr('stroke','grey')
      .attr('stroke-width',3)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

    var xAxis = d3.axisTop(xPositionScale)
      .ticks(3);

    var callAxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(60," +  "20)")
          .call(xAxis)
          .attr('display','none')
          .attr('opacity',0);

    var country = topojson.feature(jsondata, jsondata.objects.countries).features;

    var worldmap = svg.selectAll(".country")
        .data(country)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", function(d){
          return "lightgray"
        })
        .attr('stroke-width',1)
        .attr('stroke','white')
        .attr('id',function(d){
          // console.log(d)
          return d.properties.name
        })
        .attr("opacity",0)

    var cities = svg.selectAll(".city-circle")
      .data(datapoints)
      .enter().append("circle")
      .attr("class", "city-circle")
      .attr("r", function(d) {
        return 6
      })
      .attr("fill", "pink")
      .attr("opacity", 0.7)
      .attr("stroke", "#333333")
      .attr("cx", function(d) {
        var coords = projection([d.longitude, d.latitude])
        return coords[0]
      })
      .attr("cy", function(d) {
        var coords = projection([d.longitude, d.latitude])
        return coords[1]
      })
      .attr('id',function(d){
        return d.City
      })
      .attr('opacity',0)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)


    worldmap.attr('display',"none")
    cities.attr('display',"none")

    var city_name = svg.selectAll(".city-name")
      .data(datapoints)
      .enter().append("text")
      .attr("class", "city-name")
      .attr('x',40)
      .attr('y',function(d){
        // console.log(yPositionScale(d.City))
        return yPositionScale(d.City)
      })
      .text(function(d){
        return d.City
      })
      .attr('dx',"-0.35em")
      .attr('dy',"0.75em")
      .attr('display','none')
      .attr('opacity',0)
      .attr('text-anchor','end')

    var circle_name = svg.selectAll(".circle-name")
      .data(datapoints)
      .enter().append("text")
      .attr("class", "city-name")
      .attr('x',0)
      .attr('y',function(d){
        // console.log(yPositionScale(d.City))
        return yPositionScale(d.City)
      })
      .text(function(d){
        if (radiusScale(d.population) > 50){
          return d.City
        }
      })
      .attr('display','none')
      .attr('opacity','0')
      .attr('text-anchor','middle')



    console.log(datapoints)

    d3.select('#slide-1')
      .on('slidein',function(){
        worldmap
          .transition()
            .duration(1000)
            .attr('opacity',0)
          .transition()
            .attr('display','none')
        console.log('map')

        cities
          .transition()
            .duration(1000)
            .attr('opacity',0)
          .transition()
            .attr('display','none')

        d3.select('h1#title')
          .style('display','block')
          .style('opacity',1)

        d3.select('p#source')
          .style('display','block')
          .style('opacity',1)

        d3.select('p#intro')
          .style('display','none')
          .style('opacity',0)

        d3.select('img#start_img')
          .style('display','block')
          .style('opacity',1)

      })

    d3.select('#slide-2')
      .on('slidein',function(){
        worldmap
          .transition()
          .duration(1000)
          .attr('display','inline')
          .attr('opacity',1)
        console.log('map')

        d3.select('h1#title')
          .style('display','none')
          .style('opacity',0)

        d3.select('p#source')
          .style('display','none')
          .style('opacity',0)

        d3.select('p#intro')
          .style('display','block')
          .style('opacity',1)

        d3.select('p#bar_text')
          .style('display','none')
          .style('opacity',0)

        d3.select('img#start_img')
          .style('display','none')
          .style('opacity',0)

        d3.select('p#buttons')
          .style('display','none')
          .style('opacity',0)

        d3.select('.axis')
          .style('display','none')
          .style('opacity',0)

        // simulation.nodes(datapoints)
        //   .on('tick', function(d){
        //     return null
        //   })

        cities
          .transition()
            .duration(2000)
            .attr('fill','#FBE251')
            .attr('stroke','black')
            .attr('storke-width',0.2)
            .attr('display','inline')
            .attr('opacity',1)
            .attr("cx", function(d) {
              // Taking our longitude and latitude columns
              // converting them into pixel coordinates 
              // on our screen
              // and returning the first one (the x)
              var coords = projection([d.longitude, d.latitude])
              return coords[0]
            })
            .attr("cy", function(d) {
              var coords = projection([d.longitude, d.latitude])
              return coords[1]
            })
            .attr('r',6)
          .transition()
            .delay(0)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',1)
            .attr('r',6)
          .transition()
            .delay(500)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',1)
            .attr('r',6)
          .transition()
            .delay(500)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',1)
            .attr('r',6)
          .transition()
            .delay(500)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',1)
            .attr('r',6)
          .transition()
            .delay(500)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',1)
            .attr('r',6)
          .transition()
            .delay(500)
            .duration(2000)
            .attr('fill','rgb(255,177,24)')
            .attr('opacity',0)
            .attr('r',15)
          .transition()
            .delay(0)
            .duration(1)
            .attr('fill','#FBE251')
            .attr('opacity',0.7)
            .attr('r',6)

        city_name
          .transition()
            .duration(1000)
            .attr('opacity',0)
          .transition()
            .attr('display','none')

        city_bars
          .transition()
            .duration(2000)
            .attr('x',function(d){
              var coords = projection([d.longitude, d.latitude])
              return coords[0]
            })
            .attr("y", function(d) {
              var coords = projection([d.longitude, d.latitude])
              return coords[1]
            })
            .attr('width',4)
            .attr('height',4)
            .attr('opacity',0)
          .transition()
            .duration(1000)
            .attr('display','none')

        simulation.nodes(datapoints)
            .on('tick', null)


      })


    d3.select('#slide-3')
      .on('slidein',function(){
        console.log('bars')

        worldmap
          .transition()
            .duration(1000)
            .attr('opacity',0)
          .transition()
            .attr('display','none')

        d3.select('p#intro')
          .style('display','none')
          .style('opacity',0)

        d3.select('p#bar_text')
          .style('display','block')
          .style('opacity',1)

        d3.select('p#circle_text')
          .style('display','none')
          .style('opacity',0)

        d3.select('.axis')
          .style('display','block')
          .style('opacity',1)


        // simulation.nodes(datapoints)
        //   .on('tick', function(d){
        //     return null
        //   })

        cities
          .transition()
          .duration(1000)
          .attr("r", function(d) {
            return 4
          })
          .attr('opacity',1)
          .attr('cx',function(d){
            return margin.left +50
          })
          .attr('cy',function(d){
            // console.log(yPositionScale(d.City))
            return circleYPositionScale(d.City)
          })
          .attr('opacity',0)

        xPositionScale.domain(selectExt)

        var sorted = datapoints.sort(function
            (a, b) { return a[selected] - b[selected] }).map( 
            function(d) { return d.City })
        yPositionScale.domain(sorted)
 
        city_bars
          .transition()
          .duration(1000)
          .attr("x", function(d) { 
            return 60 
          })
          .attr("y", function(d) { 
            return yPositionScale(d.City); 
          })
          .attr("width", function(d){
            // console.log(xPositionScale(d.theaters))
            return xPositionScale(d[selected])
          })
          .attr("height", function(d){
            // console.log(yPositionScale.bandwidth())
            return yPositionScale.bandwidth()
          })
          .attr('opacity',0.7)
          .attr('display','inline')

        xAxis = d3.axisTop(xPositionScale)
                  .ticks(3)
        callAxis
          .call(xAxis)

        city_name
          .transition()
          .duration(1000)
          .attr('display','inline')
          .attr('opacity',1)

        circle_name
            .transition()
              .duration(1000)
              .attr('opacity',0)
            .transition()
              .duration(1000)
              .attr('display',"inline")

        d3.select('p#buttons')
          .style('display','block')
          .style('opacity',1)

        simulation.nodes(datapoints)
            .on('tick', null)


      })

      d3.select('#slide-4')
        .on('slidein',function(){
          console.log('cities')

          d3.select('p#bar_text')
            .style('display','none')
            .style('opacity',0)

          d3.select('p#circle_text')
            .style('display','inline')
            .style('opacity',1)

        d3.select('p#buttons')
          .style('display','none')
          .style('opacity',0)

        d3.select('.axis')
          .style('display','none')
          .style('opacity',0)

          city_name
            .transition()
              .duration(1000)
              .attr('opacity',0)
            .transition()
              .attr('display','none')

          city_bars
            .transition()
              .duration(2000)
              .attr('x',function(d){
                var coords = projection([d.longitude, d.latitude])
                return coords[0]
              })
              .attr("y", function(d) {
                var coords = projection([d.longitude, d.latitude])
                return coords[1]
              })
              .attr('width',4)
              .attr('height',4)
              .attr('opacity',0)
            .transition()
              .duration(1000)
              .attr('display','none')

          cities
            .transition()
            .duration(2000)
            .attr("r", function(d) {
              return radiusScale(d.population)
            })
            .attr('opacity',1)
            .attr('display',"inline")
            .attr('stroke-width',5)

          cities
            .on('click',function(d){
              console.log(d)
              
              d3.select('h2.selected_name')
                .transition()
                .text(d.City)

              d3.select('span.area_size')
                .transition()
                .text(d.area_size)

              formatValue = d3.format(".2s");
              var population = formatValue(d.population).replace('M', ' million').replace('k', ' thousand');
              console.log(population)
              d3.select('span.population')
                .transition()
                .text(population)

              var green = d3.format(".2%")(d.green)
              d3.select('span.green')
                .transition()
                .text(green)

              d3.select('span.mk')
                .transition()
                .text(d.markets)

              d3.select('span.wh')
                .transition()
                .text(d.world_heritage)

              d3.select('span.oh')
                .transition()
                .text(d.other_heritage_hist_sites)

              d3.select('span.nm')
                .transition()
                .text(d.national_museum)

              d3.select('span.ag')
                .transition()
                .text(d.art_galleries)

              d3.select('span.bs')
                .transition()
                .text(d.bookshop)

              d3.select('span.cinema')
                .transition()
                .text(d.cinema)

              d3.select('span.ch')
                .transition()
                .text(d.concer_hall)

              d3.select('span.cd')
                .transition()
                .text(d.club_disco)

              d3.select('span.bar')
                .transition()
                .text(d.bar)

              d3.select('span.rest')
                .transition()
                .text(d.restaurants)

              d3.select('span.m_rest')
                .transition()
                .text(d.michelin_rest)

              d3.select('span.theater')
                .transition()
                .text(d.theaters)

              var fb = d3.format(".2%")(d.foreign_born) 
              d3.select('span.fb')
                .transition()
                .text(fb)

              var it = d3.format(",")(d.inter_student)
              d3.select('span.it')
                .transition()
                .text(it)

              d3.select('span.is')
                .transition()
                .text(d.theaters)

              d3.select('span.ff')
                .transition()
                .text(d.film_fes)

              d3.select('span.fc')
                .transition()
                .text(d.fes_cel)

              d3.select('span.tp')
                .transition()
                .text(d.theatrical_performance)

              d3.select('span.dp')
                .transition()
                .text(d.dance_performance)

              d3.select('span.pic')
                .transition()
                .text(d.pop_in_city_per)
  
              d3.select('span.ipc')
                .transition()
                .text(d.income_percap)

              d3.select('span.gdp')
                .transition()
                .text(d.gdp)

              d3.select('span.vae')
                .transition()
                .text(d.visit_artexh)

              var edu = d3.format(".2%")(d.edu_level)
              d3.select('span.edu')
                .transition()
                .text(edu)

              d3.select('span.ctpc')
                .transition()
                .text(d.cinema_tic_percap)

              var aoc = d3.format(".2%")(d.att_carnival)
              d3.select('span.aoc')
                .transition()
                .text(aoc)
            })


          simulation.nodes(datapoints)
            .on('tick', ticked)


      })


      // d3.select('#slide-5')
      //   .on('slidein',function(){

      //     console.log('slide in city detail')

      //     simulation.nodes(datapoints)
      //       .on('tick', null)

      //     circle_name
      //       .transition()
      //         .attr('display','none')

      //     cities
      //       .transition()
      //         .duration(2000)
      //         .attr('opacity',0.2)
      //         .attr('cx',100)
      //         .attr('cy',100)




          
      // })




      d3.selectAll('button')
        .on('click',function(d){
          console.log(this.id)

          d3.selectAll('button').classed('selected',false)
          d3.select(this).classed('selected',true)

          selected = this.id

          console.log(selected)

          var sorted = datapoints.sort(function
            (a, b) { return a[selected] - b[selected] }).map( 
            function(d) { return d.City })

          console.log(sorted)

          selectExt = d3.extent(datapoints,function(d){
            return d[selected]
          })

          console.log(selectExt)

          xPositionScale.domain(selectExt)

          yPositionScale.domain(sorted)

          xAxis = d3.axisTop(xPositionScale)
                  .ticks(3)

          callAxis
            .transition()
            .duration(1000)
            .call(xAxis)

          city_bars
            .transition()
            .duration(1000)
            .attr("width", function(d){
              return xPositionScale(d[selected])
            })
            .attr("y", function(d) { 
              return yPositionScale(d.City); 
            })


          city_name
            .transition()
            .duration(1000)
            .attr("y", function(d) { 
              return yPositionScale(d.City); 
            })



        })

      function ticked() {
        cities
            // .transition()
            // .duration(1000)
            .attr("cx", function(d) { 
              return d.x; })
            .attr("cy", function(d) { return d.y; });

        circle_name
            .transition()
            .delay(1)
            .attr('display','inline')
            .attr('opacity','1')
            .attr("x", function(d) { 
              return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr('dy','0.35em');

      }





  }
})();