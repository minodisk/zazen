$window = $ window
$document = $ document

$document.one 'ready', ->

  $links = $ '.toc a'
  $titles = $links
  .filter (i, el) ->
      $link = $ el
      href = $link.attr 'href'
      href isnt '#' and href.charAt(0) is '#'
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
      if ($title.position().top >> 0) <= top
        $link = $title.data '$link'
        break
    $links.removeClass 'is-current'
    if $link?
      $link.addClass 'is-current'
#      location.hash = $link.attr 'href'
#    else
#      location.hash = ''