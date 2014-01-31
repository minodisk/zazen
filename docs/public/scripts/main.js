(function() {
  var $document, $window;

  $window = $(window);

  $document = $(document);

  $document.one('ready', function() {
    var $links, $titles, length;
    $links = $('ul.toc_section li a');
    $titles = $links.map(function(i, el) {
      var $link;
      $link = $(el);
      return $($link.attr('href')).data({
        $link: $link
      });
    });
    length = $titles.length;
    return $document.on('scroll', function(e) {
      var $link, $title, i, top;
      top = $window.scrollTop();
      i = length;
      while (i--) {
        $title = $($titles[i]);
        if (($title.offset().top >> 0) <= top) {
          $link = $title.data('$link');
          break;
        }
      }
      $links.removeClass('is-current');
      if ($link != null) {
        return $link.addClass('is-current');
      }
    });
  });

}).call(this);
