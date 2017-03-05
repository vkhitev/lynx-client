/* global Highcharts, $, fetch */

function normalizeTime (time) {
  if (time < 10) {
    return '0' + time
  } else {
    return time
  }
}

function secondsToTime (secs) {
  if (secs < 60) {
    return '00:' + normalizeTime(secs)
  }
  let minutes = Math.floor(secs / 60)
  let seconds = secs % 60
  if (minutes < 60) {
    return normalizeTime(minutes) + ':' + normalizeTime(seconds)
  }
  let hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  return normalizeTime(hours) + ':' + normalizeTime(minutes) + ':' + normalizeTime(seconds)
}

function genTime (num, period, each, start) {
  const times = []
  for (let i = 0; i < num; i++) {
    if (i % each !== 0) {
      times.push('')
    } else {
      times.push(secondsToTime((i + start) * period))
    }
  }
  return times
}

function redraw (containerId, data, callback) {
  const el = $('#' + containerId)
  el.stop().fadeOut(150, function () {
    Highcharts.chart(containerId, {
      chart: {
        type: 'areaspline',
        animation: false
      },
      exporting: false,
      title: false,
      legend: false,
      xAxis: {
        categories: genTime(data.statistics.length, data.chunkDuration, 1, data.offset),
        plotBands: [{
          from: data.current,
          to: data.current + 1,
          color: 'rgba(129, 45, 32, .2)'
        }],
        min: 0.5,
        max: 3.5,
        labels: {
          x: 80,
          y: 27
        }
      },
      yAxis: {
        title: false,
        min: -1,
        max: 1
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          animation: false
        },
        areaspline: {
          fillOpacity: 0.5,
          fillColor: 'rgba(229, 45, 32, .4)',
          lineColor: 'rgba(229, 45, 32, .6)',
          states: {
            hover: false
          }
        }
      },
      tooltip: {
        valueSuffix: '%',
        formatter: function (val) {
          const fakeY = this.point.y * 100
          return fakeY.toFixed(2) + '%'
        }
      },
      series: [{
        marker: {
          enabled: true,
          radius: -2
        },
        name: 'Качество',
        data: data.statistics
      }]
    }, function () {
      el.stop().fadeIn(150, callback)
    })
  })
}

function actualToRender (chunk) {
  switch (chunk.current) {
    case 1:
      return {
        chunkDuration: chunk.duration,
        offset: 1,
        statistics: chunk.stats,
        current: -0.5
      }
    case 2:
      return {
        chunkDuration: chunk.duration,
        offset: 1,
        statistics: chunk.stats,
        current: 0.5
      }
    case chunk.total - 1:
      return {
        chunkDuration: chunk.duration,
        offset: 3,
        statistics: chunk.stats,
        current: 2.5
      }
    case chunk.total:
      return {
        chunkDuration: chunk.duration,
        offset: 3,
        statistics: chunk.stats,
        current: 3.5
      }
    default:
      return {
        chunkDuration: chunk.duration,
        offset: chunk.current - 2,
        statistics: chunk.stats,
        current: 1.5
      }
  }
}

function normalizeStats (likes, dislikes) {
  if (likes > dislikes) {
    return likes / (likes + dislikes)
  } else if (dislikes > likes) {
    return -dislikes / (likes + dislikes)
  } else {
    return 0
  }
}

function prepareData (data) {
  if (data.length < 7) {
    throw new Error('Соси писос')
  }
  data.sort((a, b) => a.timeStart - b.timeStart)
  const total = data.length
  const retval = []
  const rates = []
  for (let i = 0; i < total; i++) {
    rates.push(normalizeStats(data[i].likes, data[i].dislikes))
  }
  for (let i = 0; i < total; i++) {
    let currentRate
    if ([0, 1, 2].includes(i)) {
      currentRate = rates.slice(0, 5)
    } else if ([total, total - 1, total - 2].includes(i)) {
      currentRate = rates.slice(total - 5, total)
    } else {
      currentRate = rates.slice(i - 2, i + 3)
    }
    retval.push({
      total,
      current: i + 1,
      duration: 30,
      stats: currentRate
    })
  }
  return retval
}

// $('#like-btn').on('click', function () {
//   fetch('PostVideoTimeLike/like/' + 2, {
//     method: 'POST'
//   })
// })

// $('#dislike-btn').on('click', function () {
//   fetch('/PostVideoTimeLike/dislike/' + videoId, {
//     method: 'POST'
//   })
// })

function reprint (videoId, videoSecond, callback) {
  fetch(`/video/getVideoTimeLikes/${videoId}`)
    .then(res => res.json())
    .then(data => {
      const duration = Math.floor((data[0].timeFinish - data[0].timeStart) / 1000)
      const currentChunk = Math.floor(videoSecond / duration)
      const prepared = prepareData(data).map(actualToRender)
      redraw(`chart-container-${videoId}`, prepared[currentChunk], callback)
    })
}
