$window = $ window
$document = $ document

$document.one 'ready', ->

  $links = $ 'ul.toc_section li a'
  $titles = $links
  .map (i, el) ->
      $link = $ el
      $ $link.attr 'href'
      .data $link: $link
  length = $titles.length

  $document.on 'scroll', (e) ->
    top = $window.scrollTop()
    i = length
    while i--
      $title = $ $titles[i]
      if ($title.offset().top >> 0) <= top
        $link = $title.data '$link'
        break
    $links.removeClass 'is-current'
    if $link?
      $link.addClass 'is-current'
#      location.hash = $link.attr 'href'
#    else
#      location.hash = ''