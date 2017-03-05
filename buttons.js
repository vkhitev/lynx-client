/* global $ */

function initLikeAddButtons () {
  // отключаем переход по блоченной ссылке
  $('.disabled').on('click', function (e) { e.preventDefault() })

  // лайк в предложке
  $('.btn-like-add').click(function () {
    // когда убираешь лайк (лайк стоит)
    if ($(this).is('.add-like-active')) {
      $(this).html('<i class="fa fa-heart-o fa-2x" aria-hidden="true"></i>')
      $(this).removeClass('add-like-active')
    }

    // когда ставишь лайк
    else {
      $(this).html('<i class="fa fa-heart fa-2x" style="color: firebrick" aria-hidden="true"></i>')
      $(this).addClass('add-like-active')
    }
  })

    // дизлайк в предложке
  $('.btn-dis-add').click(function () {
    // когда убираешь дизлайк (дизлайк стоит)
    if ($(this).is('.add-dislike-active')) {
      $(this).html('<i class="fa fa-thumbs-o-down fa-2x" aria-hidden="true"></i>')
      $(this).removeClass('add-dislike-active')
    }

    // когда ставишь дизлайк
    else {
      $(this).html('<i class="fa fa-thumbs-down fa-2x" aria-hidden="true"></i>')
      $(this).addClass('add-dislike-active')
    }
  })
}

function initLikeButtons () {
  // отключаем переход по блоченной ссылке
  $('.disabled').on('click', function (e) { e.preventDefault() })

  // нажатие на основной лайк на лайве
  $('.btn-like').click(function () {
    // когда убираешь лайк (лайк стоит)
    if ($(this).is('.like-active')) {
      $(this).html('<i class="fa fa-heart-o fa-2x" aria-hidden="true"></i>')
      $(this).removeClass('like-active')
    }

    // когда ставишь лайк
    else {
      $(this).html('<i class="fa fa-heart fa-2x" style="color: firebrick" aria-hidden="true"></i>')
      $(this).addClass('like-active')
    }
  })
}
