var Minesweeper = {
  init: function() {
    Minesweeper.settings = {
      bombs: 15,
      height: 20,
      width: 20
    };
    
    Minesweeper.appendto = $('#minesweeper'),
        html = '<div class="bombsleft">' + Minesweeper.settings.bombs + '</div>' +
        '<div class="timer">999</div>' +
        '<div class="smiley">:-|</div>' +
        '<div class="game"></div>' +
        '<div class="config"><a href="#" class="setup">Set up amount of bombs, width and height&hellip;</a></div>';
    
    Minesweeper.wrapper = Minesweeper.appendto.append(html).find('.game');
    
    Minesweeper.appendto.find('.smiley').click(Minesweeper.newGame);
    
    Minesweeper.appendto.find('.setup').click(Minesweeper.setup);
    Minesweeper.wrapper.dblclick(Minesweeper.handleDblClick);
    Minesweeper.wrapper.click(Minesweeper.handleClick);
    Minesweeper.wrapper.mousedown(Minesweeper.handleLeftClickA);
    Minesweeper.wrapper.mouseup(Minesweeper.handleLeftClickB);
    
    document.onselectstart = function () {
      if (event.srcElement.type != 'text' && event.srcElement.type != 'textarea' && event.srcElement.type != 'password')
        return false;
      else
        return true;
    }
    
    Minesweeper.wrapper.bind('contextmenu', function(e) {
      if (Minesweeper.dead || Minesweeper.won) return;
      e.preventDefault();
    });
    
    Minesweeper.newGame();
  },
  
  
  newGame: function() {
    Minesweeper.wrapper.css({
      height: Minesweeper.settings.height * 20 + 'px',
      width: Minesweeper.settings.width * 20 + 'px'
    });
    
    Minesweeper.appendto.css('width', Minesweeper.settings.width * 20 + 'px');
    
    Minesweeper.createHtml();
    Minesweeper.firstClick = true;
    Minesweeper.observeLeftClick = false;
    Minesweeper.dead = false;
    Minesweeper.won = false;
    Minesweeper.stopTimer();
    Minesweeper.appendto.find('.bombsleft').html(Minesweeper.settings.bombs);
    Minesweeper.appendto.find('.timer').html(999);
    Minesweeper.appendto.find('.smiley').html(':-|');
  },
  
  
  setup: function(e) {
    e.preventDefault();
    
    var newSettings = {
      bombs: parseInt('0' + prompt('How many bombs?'), 10),
      height: parseInt('0' + prompt('How heigh?'), 10),
      width: parseInt('0' + prompt('How wide?'), 10)
    }
    
    if (newSettings.bombs === 0) newSettings.bombs = 1;
    if (newSettings.height < 5) newSettings.height = 5;
    if (newSettings.width < 5) newSettings.width = 5;
    if (newSettings.height > 40) newSettings.height = 40;
    if (newSettings.width > 40) newSettings.width = 40;
    
    var maxBombs = newSettings.height * newSettings.width;
    
    if (newSettings.bombs> maxBombs) newSettings.bombs = maxBombs - 1;
    
    $.extend(Minesweeper.settings, newSettings);
    
    Minesweeper.newGame();
  },
  
  
  createHtml: function() {
    Minesweeper.wrapper.children().remove();
    
    var html = '',
        s = Minesweeper.settings;
    
    for (var i = 0; i < s.height; ++i) {
      for (var j = 0; j < s.width; ++j) {
        html += '<div data-x="' + j + '" data-y="' + i + '"></div>';
      }
    }
    
    Minesweeper.wrapper.append(html);
  },
  
  
  handleClick: function(e) {
    if (Minesweeper.dead || Minesweeper.won) return;
    
    var tgt = $(e.target),
      x = parseInt(tgt.attr('data-x'), 10),
      y = parseInt(tgt.attr('data-y'), 10);
    
    if (Minesweeper.firstClick) {
      Minesweeper.generate(x, y);
      Minesweeper.firstClick = false;
      Minesweeper.setTimer();
    }
    
    if (Minesweeper.clicked[y][x] == 'f') return;
    
    if (Minesweeper.grid[y][x] === true) {
      Minesweeper.die(x, y);
      return;
    }
    else
      Minesweeper.expandEmpty(x, y);
  },
  
  
  handleLeftClickA: function(e) {
    if (Minesweeper.dead || Minesweeper.won) return;
    
    if (e.which == 3) {
      Minesweeper.observeLeftClick = true;
      e.preventDefault();
    }
  },
  
  
  handleLeftClickB: function(e) {
    if (Minesweeper.dead || Minesweeper.won) return;
    
    if (!Minesweeper.observeLeftClick) return;
    
    e.preventDefault();
    
    var tgt = $(e.target),
      x = parseInt(tgt.attr('data-x'), 10),
      y = parseInt(tgt.attr('data-y'), 10);
    
    if (Minesweeper.clicked[y][x] === true) return;
    
    if (Minesweeper.clicked[y][x] == 'f') {
      Minesweeper.clicked[y][x] = false;
      Minesweeper.getDiv(x, y).removeClass('flag');
    }
    else {
      Minesweeper.clicked[y][x] = 'f';
      Minesweeper.getDiv(x, y).addClass('flag');
    }
    
    Minesweeper.observeLeftClick = false;
    
    Minesweeper.flagsLeft();
  },
  
  
  handleDblClick: function(e) {
    if (Minesweeper.dead || Minesweeper.won) return;
    
    e.preventDefault();
    
    var tgt = $(e.target),
      x = parseInt(tgt.attr('data-x'), 10),
      y = parseInt(tgt.attr('data-y'), 10);
    
    if (Minesweeper.clicked[y][x] == 'f') return;
    
    if (Minesweeper.grid[y][x] === true) {
      Minesweeper.die(x, y);
      return;
    }
    else {
      var amount = Minesweeper.grid[y][x],
          count = 0;
      
      if (amount > 0) {
        function increment(dx, dy) {
          if (Minesweeper.clicked[dy][dx] == 'f')
            ++count;
        }
        
        Minesweeper.adjecents(x, y, increment);
        
        if (count == amount) {
          Minesweeper.expandFlag(x, y);
        }
      }
    }
  },
  
  
  generate: function(clickx, clicky) {
    Minesweeper.grid = [];
    Minesweeper.clicked = [];
    
    var count = 0,
      s = Minesweeper.settings;
    
    for (var i = 0; i < s.height; ++i) {
      Minesweeper.grid[i] = [];
      Minesweeper.clicked[i] = [];
      for (var j = 0; j < s.width; ++j) {
        Minesweeper.grid[i][j] = 0;
        Minesweeper.clicked[i][j] = false;
      }
    }
    
    while (count < s.bombs) {
      var x = parseInt(Math.random() * s.width, 10);
      var y = parseInt(Math.random() * s.height, 10);
      
      if (Minesweeper.grid[y][x] === true || (clickx == x && clicky == y)) continue;
      
      Minesweeper.grid[y][x] = true;
      ++count;
      
      function increment(dx, dy) {
        if (Minesweeper.grid[dy][dx] !== true)
          ++Minesweeper.grid[dy][dx];
      }
      
      Minesweeper.adjecents(x, y, increment);
    }
  },
  
  
  getDiv: function(x, y) {
    return Minesweeper.wrapper.find('div:eq(' + (y * Minesweeper.settings.width + x) + ')');
  },
  
  
  win: function() {
    if (Minesweeper.won) return;
    
    Minesweeper.won = true;
    $('.bombsleft').html('0');
    Minesweeper.stopTimer();
    
    var time = Minesweeper.updateTimer();
    
    $('.smiley').html(':-)');
  },
  
  
  die: function(x, y) {
    Minesweeper.dead = true;
    for (var i = 0; i < Minesweeper.settings.height; ++i) {
      for (var j = 0; j < Minesweeper.settings.width; ++j) {
        if (Minesweeper.grid[i][j] === true && Minesweeper.clicked[i][j] != 'f')
          Minesweeper.getDiv(j, i).addClass('bomb');
        if (Minesweeper.grid[i][j] > 0 && typeof Minesweeper.grid[i][j] != 'boolean' && Minesweeper.clicked[i][j] == 'f')
          Minesweeper.getDiv(j, i).addClass('bomb-flag').removeClass('flag');
      }
    }
    Minesweeper.getDiv(x, y).addClass('bomb-exploded');
    Minesweeper.stopTimer();
    
    $('.smiley').html(':-(');
  },
  
  
  flagsLeft: function() {
    var flagCount = 0,
        empty = 0;
    
    for (var i = 0; i < Minesweeper.settings.height; ++i) {
      for (var j = 0; j < Minesweeper.settings.width; ++j) {
        if (Minesweeper.clicked[i][j] === 'f')
          ++flagCount;
        if (Minesweeper.clicked[i][j] === false)
          ++empty;
      }
    }
    
    var setToFlagCount = Minesweeper.settings.bombs - flagCount;
    
    if (setToFlagCount == empty) {
      for (var i = 0; i < Minesweeper.settings.height; ++i) {
        for (var j = 0; j < Minesweeper.settings.width; ++j) {
          if (Minesweeper.clicked[i][j] === false) {
            Minesweeper.getDiv(j, i).addClass('flag');
            Minesweeper.clicked[i][j] = 'f';
          }
        }
      }
      
      Minesweeper.win();
    }
    
    if (setToFlagCount < 0)
      setToFlagCount = 0;
    
    if (empty === 0)
      Minesweeper.win();
    
    if (!Minesweeper.won)
      $('.bombsleft').html(setToFlagCount);
  },
  
  
  expandEmpty: function(x, y) {
    if (Minesweeper.clicked[y][x] === true || Minesweeper.clicked[y[x] == 'f']) return;
    
    Minesweeper.clicked[y][x] = true;
    
    var val = Minesweeper.grid[y][x],
      div = Minesweeper.getDiv(x, y);
    
    div.addClass('f-' + val);
    
    if (val == 0)
      Minesweeper.adjecents(x, y, Minesweeper.expandEmpty);
    else
      div.html(val);
    
    Minesweeper.flagsLeft();
  },
  
  
  expandFlag: function(x, y) {
    function check(dx, dy) {
      if (Minesweeper.clicked[dy][dx] == 'f') return;
      
      if (Minesweeper.grid[dy][dx] === true) {
        Minesweeper.die(dx, dy);
        return;
      }
      else {
        var amount = Minesweeper.grid[dy][dx],
            div = Minesweeper.getDiv(dx, dy);
        
        div.addClass('f-' + amount);
        Minesweeper.clicked[dy][dx] = true;
        
        if (amount === 0) {
          Minesweeper.adjecents(dx, dy, Minesweeper.expandEmpty);
        }
        else
          div.html(amount);
      }
    }
    
    Minesweeper.adjecents(x, y, check);
    Minesweeper.flagsLeft();
  },
  
  
  adjecents: function(x, y, callback) {
    if (y > 0) {
      if (x > 0)
        callback(x - 1, y - 1);
      if (x < (Minesweeper.settings.width - 1))
        callback(x + 1, y - 1);
      callback(x, y - 1);
    }
    if (y < (Minesweeper.settings.height - 1)) {
      if (x > 0)
        callback(x - 1, y + 1);
      if (x < (Minesweeper.settings.width - 1))
        callback(x + 1, y + 1);
      callback(x, y + 1);
    }
    if (x > 0)
      callback(x - 1, y);
    if (x < (Minesweeper.settings.width - 1))
      callback(x + 1, y);
  },
  
  
  setTimer: function() {
    Minesweeper.startTime = (new Date()).getTime();
    Minesweeper.timer = setInterval(Minesweeper.updateTimer, 100);
  },
  
  
  updateTimer: function() {
    var currentTime = (new Date()).getTime(),
        difference = Math.round((currentTime - Minesweeper.startTime) / 1000);
    
    Minesweeper.appendto.find('.timer').html(difference);
    
    return difference;
  },
  
  
  stopTimer: function() {
    clearInterval(Minesweeper.timer);
  }
}

$(Minesweeper.init);