console.log('working...')

console.log(count)

let sorted = JSON.parse(count).sort()
let object_count = []

let counted = sorted.reduce(function (acc, curr) {
    if (typeof acc[curr] == 'undefined') {
      acc[curr] = 1;
    } else {
      acc[curr] += 1;
    }
    return acc;
}, {})

for (const [key, value] of Object.entries(counted)) {
    if (key !== 'DD') {
        object_count.push({ symbol: key, count: value })
    }
}

// https://www.webtips.dev/how-to-make-interactive-bubble-charts-in-d3-js
const width = window.innerWidth 
const height = window.innerHeight 

// const colors = [
//     '#F16529',
//     '#1C88C7',
//     '#FCC700'
// ]

const colors = ['#E8491E', '#0A7CFF', '#FFDD2D']

const bubbles = data => d3.pack()
    .size([width, height])
    .padding(8)(d3.hierarchy({ children: data }).sum(d => d.count))

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)

/* --- THIS IS COPIED FROM ANOTHER SOURCE TO APPLY THE DROP SHADOW TO SVG --- */
/* --- SRC: https://gist.github.com/cpbotha/5200394 --- */
// filter chain comes from:
// https://github.com/wbzyl/d3-notes/blob/master/hello-drop-shadow.html
// cpbotha added explanatory comments
// read more about SVG filter effects here: http://www.w3.org/TR/SVG/filters.html

// filters go in defs element
var defs = svg.append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
var filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 5)
    .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 5)
    .attr("dy", 5)
    .attr("result", "offsetBlur");

// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");
/* --- THIS IS THE END OF THE COPIED SOURCE --- */

const root = bubbles(object_count)
const node = svg.selectAll()
    .data(root.children)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)

// url(#drop-shadow)

const circle = node.append('circle')
    .attr('r', d => d.r)
    .style('fill', (_) => colors[Math.floor(Math.random() * colors.length)])
    .attr('id', d => d.data.symbol)
    .on('mouseover', (x, y) => {
        console.log(y)
        d3.select(`#${y.data.symbol}`)
            .attr('filter', 'url(#drop-shadow)')
        
    })
    .on('mouseout', (_, y) => {
        console.log(y)
        d3.select(`#${y.data.symbol}`)
            .attr('filter', 'none')
        
    })

const label = node.append('text')
    .text(d => {
        if (d.r > 30) {
            return d.data.symbol
        }
    })
    .attr("text-anchor", "middle")
    .attr('fill', '#000000')