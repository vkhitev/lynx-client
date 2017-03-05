/* global $, fetch, videoLoader, reprint, initLikeAddButtons, initLikeButtons */

function millisecondsToDate (ms) {
  const time = new Date(ms)
  let hours = time.getHours()
  if (hours < 10) {
    hours = '0' + hours
  }
  let minutes = time.getHours()
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  return hours + ':' + minutes
}

function createLiveCard (data) {
  return `
<li>
  <div class="card mb-2" id="channel-${data.chanelId}">
    <div class="card-header">
      <div class="row align-items-center">
        <div class="col-1 text-center">
          ${data.chanelName}
        </div>
        <div class="col-6 text-center">
          ${data.currentVideoName}
        </div>
        <div class="col-2 text-center">
          ${millisecondsToDate(data.timeStart)} – ${millisecondsToDate(data.timeFinish)}
        </div>
        <div class="col-3 text-center">
          <a class="btn-collapse-channel btn btn-outline-secondary" style="color: black;" data-toggle="collapse" href="#collapse-channel-${data.chanelId}">
            <i class="fa fa-bars fa-2x" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</li>`
}

function createLiveCollapse (channelId, collapseId, data) {
  return `
<div class="collapse" id="${collapseId}">
  <div class="card-block">
    <div class="container">
      <div class="row">
        <div class="col-8">
          <div id="recommends-container-${channelId}" class="card">
            <div class="card-img-top embed-responsive embed-responsive-16by9">
              <div id="live-video-${channelId}"></div>
            </div>
            <div class="card-header clearfix">
              <a class="btn btn-outline-secondary btn-like" role="button" aria-pressed="true"><i class="fa fa-heart-o fa-2x" aria-hidden="true"></i></a>
              <a id="btn-collapse-recommends-${channelId}" class="btn btn-outline-secondary float-right" style="color: black" data-toggle="collapse" href="#collapse-recommends-${channelId}" aria-expanded="false"
                aria-controls="collapseProp1">
                <i class="fa fa-ellipsis-h fa-2x" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="col-4 ">
          <div class="schedule" style="max-height: 450px; overflow: auto;">
            <table class="table ">
              <thead class="thead-default ">
                <tr>
                  <th>Время</th>
                  <th>Программа</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(element => `
                  <tr>
                    <th scope="row">${millisecondsToDate(element.timeStart)}</th>
                    <td>${element.name}</td>
                  </tr>
                `).join(' ')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
}

function createRecommendsCollapse (data, collapseRecommendsId) {
  return `
<div class="collapse" id="${collapseRecommendsId}">
  ${data.map((element, idx) => {
    const url = element.url.replace(/.+=/, '')
    return `
      <div class="card-block">
        <div class="card mb-2">
          <div class="card-block">
            <div class="media">
              <div class="media-body">
                <h5 class="pt-3">
                  <a class="recommend-link" data-toggle="modal" href="#modal-${element.videoId}">${element.name}</a>
                </h5>
              </div>
              <img class="d-flex align-self-center ml-3" height="64" src="https://img.youtube.com/vi/${url}/0.jpg"/>
            </div>
          </div>
        </div>
      </div>`
  }).join(' ')}
</div>`
}

function createModal (data) {
  return `
<div class="modal fade bd-example-modal-lg" id="modal-${data.videoId}" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
  aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${data.name}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="container">
          <div class="card">
            <div class="card-img-top embed-responsive embed-responsive-16by9">
              <div id="recommended-video-${data.videoId}"></div>
            </div>
            <div class="card-header clearfix">
              <a id="btn-like-${data.videoId}" class="btn btn-outline-secondary btn-like-add" role="button" aria-pressed="true"><i class="fa fa-heart-o fa-2x" aria-hidden="true"></i></a>
              <a id="btn-dislike-${data.videoId}" class="btn btn-outline-secondary btn-dis-add" role="button" aria-pressed="true"><i class="fa fa-thumbs-o-down fa-2x" aria-hidden="true"></i></a>
              <a id="chart-${data.videoId}" class="btn btn-outline-secondary float-right" style="color: black" data-toggle="collapse" href="#collapse-chart-${data.videoId}"
                aria-expanded="false" aria-controls="collapseChart1">
                <i class="fa fa-area-chart fa-2x" aria-hidden="true"></i>
              </a>
            </div>

            <div class="collapse" id="collapse-chart-${data.videoId}">
              <div class="card card-block pl-0">
                <div class="mx-auto" id="chart-container-${data.videoId}" style=" height: 300px; width: 700px;"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
}

function parseJSON (x) {
  return x.json()
}

$(document).ready(function () {
  fetch('/chanel/getNames')
    .then(parseJSON)
    .then(channelList => {
      $('#card-container').append(`
        <ul class="list-unstyled">
          ${channelList.map((createLiveCard)).join(' ')}
        </ul>`
      )

      Array.from(document.getElementsByClassName('btn-collapse-channel')).forEach((button, idx) => {
        const channelId = channelList[idx].chanelId
        const collapseChannelClickHandler = function (e) {
          fetch(`/chanel/getProgram/${channelId}`)
            .then(parseJSON)
            .then(program => {
              const card = $(`#channel-${channelId}`)
              const collapseId = button.href.replace(/.+#/, '')
              card.append(createLiveCollapse(channelId, collapseId, program))
              initLikeButtons()
              button.removeEventListener('click', collapseChannelClickHandler)
              button.click()
              videoLoader.load(`live-video-${channelId}`, channelList[idx].currentChanelUrl, () => null, () => null)

              const btnCollapseRecommends = document.getElementById(`btn-collapse-recommends-${channelId}`)
              const collapseRecommendsClickHandler = function (e) {
                const tag = channelList[idx].tag
                fetch(`/video/getRecommendations/${tag}`)
                  .then(parseJSON)
                  .then(recommends => {
                    const recommendsContainer = $(`#recommends-container-${channelId}`)
                    const collapseRecommendsId = btnCollapseRecommends.href.replace(/.+#/, '')
                    recommendsContainer.append(createRecommendsCollapse(recommends, collapseRecommendsId))
                    btnCollapseRecommends.removeEventListener('click', collapseRecommendsClickHandler)
                    btnCollapseRecommends.click()

                    const recommendLinks = $(`#${collapseRecommendsId}`).find('.recommend-link')
                    recommendLinks.each((idx, link) => {
                      const recommend = recommends[idx]
                      link.addEventListener('click', function () {
                        const parent = $(`#${collapseRecommendsId}`)
                        parent.append(createModal(recommend))
                        initLikeAddButtons()
                        let videoSecond = 0
                        fetch('/video/getVideoStart/' + recommend.videoId)
                          .then(res => res.json())
                          .then(data => {
                            const serverTime = parseFloat(data)
                            const like = $(`#btn-like-${recommend.videoId}`)
                            const dislike = $(`#btn-dislike-${recommend.videoId}`)

                            let timeout = null
                            let lastTime = 0
                            let c = 0
                            function onModalPlayerChange (event) {
                              const player = event.target

                              if (player.getCurrentTime() > 30 * 60) {
                                window.location.href = '/'
                              }

                              lastTime = Math.floor(player.getCurrentTime() / 30) * 30
                              if (timeout === null) {
                                timeout = setInterval(() => {
                                  let currentTime = Math.floor(player.getCurrentTime() / 30) * 30
                                  c = currentTime
                                  if (lastTime - currentTime !== 0) {
                                    lastTime = Math.floor(player.getCurrentTime() / 30) * 30
                                    reprint(recommend.videoId, currentTime, () => {
                                      like.removeClass('disabled')
                                      dislike.removeClass('disabled')
                                    })
                                  }
                                }, 1000)
                              }

                              switch (event.data) {
                                case -1: // STARTED
                                  player.seekTo(1)
                                  like.removeClass('disabled')
                                  dislike.removeClass('disabled')
                                  break
                                case 2: // PAUSED
                                  if (c !== lastTime) {
                                    reprint(recommend.videoId, player.getCurrentTime(), () => {
                                      like.removeClass('disabled')
                                      dislike.removeClass('disabled')
                                    })
                                  }
                                  break
                              }
                            }

                            const player = videoLoader.load(`recommended-video-${recommend.videoId}`, recommend.url, function (event) {
                              like.addClass('disabled')
                              dislike.addClass('disabled')
                            }, onModalPlayerChange)
                            like.on('click', function () {
                              like.addClass('disabled')
                              dislike.addClass('disabled')
                              console.log('LIKE')
                              fetch(`/statistic/postVideoTimeLike/like/${recommend.videoId}/${serverTime + player.getCurrentTime()}`, {
                                method: 'POST'
                              }).then(console.log)
                            })
                            dislike.on('click', function () {
                              dislike.addClass('disabled')
                              like.addClass('disabled')
                              console.log('DISLIKE')
                              fetch(`/statistic/postVideoTimeLike/dislike/${recommend.videoId}/${serverTime + player.getCurrentTime() * 1000}`, {
                                method: 'POST'
                              }).then(console.log)
                            })
                            const chartEl = $(`#collapse-chart-${recommend.videoId}`)
                            chartEl.on('shown.bs.collapse', function () {
                              reprint(recommend.videoId, videoSecond)
                              chartEl.off('shown.bs.collapse')
                            })
                          })
                      })
                    })
                  })
              }
              btnCollapseRecommends.addEventListener('click', collapseRecommendsClickHandler)
            })
        }
        button.addEventListener('click', collapseChannelClickHandler)
      })
    })
})

