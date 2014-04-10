(function () {
  function flashService($rootScope) {
    return {
      notify: function (message, isFlash) {
        if (isFlash) {
          $rootScope.$emit('event:flashMessageEvent', message);
        } else {
          $rootScope.$emit('event:notification', message);
        }
      }
    };
  }
  angular.module('ntd.services', []).factory('flash', [
    '$rootScope',
    flashService
  ]);
}());
(function () {
  'use strict';
  function flashMessageService($rootScope) {
    return {
      notify: function (message) {
        $rootScope.$emit('event:flashMessageEvent', message);
      }
    };
  }
  angular.module('ntd.services').factory('flashMessage', [
    '$rootScope',
    flashMessageService
  ]);
}());
'use strict';
angular.module('ntd.config', []).value('$ntdConfig', {});
angular.module('ntd.directives', ['ntd.config']);
(function (ng) {
  'use strict';
  var AdminuiFrame = function (adminuiFrameProvider, $rootScope, $location, $timeout) {
    return {
      restrict: 'A',
      templateUrl: 'templates/adminui-frame.html',
      transclude: true,
      scope: {
        userInfo: '=',
        messages: '='
      },
      link: function (scope, elem, attrs) {
        scope.isSubMenuShow = adminuiFrameProvider.defaultShowSubmenu;
        scope.isMessageBoxShow = adminuiFrameProvider.showMessageBox;
        scope.navigation = adminuiFrameProvider.navigation;
        scope.messages = scope.messages ? scope.messages : [];
        scope.userInfo = ng.extend({
          'username': 'N/A',
          'avatar': 'images/avatar.jpg',
          'logout': function () {
            console.log('logout');
          },
          'changePwd': function () {
            console.log('change password');
          }
        }, scope.userInfo);
        init(scope.navigation);
        $rootScope.$on('$routeChangeStart', function () {
          selectPath(scope, $location.path());
        });
        scope.select = ng.bind(scope, select, $timeout, elem);
        scope.toggleSubMenu = ng.bind(scope, toggleSubMenu);
        scope.selectNav = ng.bind(scope, selectNav);
        scope.selectMenu = ng.bind(scope, selectMenu);
        scope.isSelected = ng.bind(scope, isSelected);
        scope.setSideMenu = ng.bind(scope, setSideMenu, elem);
        scope.logout = ng.bind(scope, logout);
        scope.changePwd = ng.bind(scope, changePwd);
        selectPath(scope, $location.path());
      }
    };
  };
  var logout = function (evt) {
    evt.preventDefault();
    this.userInfo.logout();
  };
  var changePwd = function (evt) {
    evt.preventDefault();
    this.userInfo.changePwd();
  };
  var init = function (navigation) {
    var parentNav = arguments[1] === undefined ? null : arguments[1];
    var level = arguments[2] === undefined ? 0 : arguments[2];
    ng.forEach(navigation, function (nav) {
      nav.parentNav = parentNav;
      nav.level = level + 1;
      if (nav.children != null) {
        init(nav.children, nav, nav.level);
      }
    });
  };
  var getEndChildren = function (navigation) {
    var endChildren = arguments[1] ? arguments[1] : [];
    ng.forEach(navigation, function (nav) {
      if (nav.children == null) {
        endChildren.push(nav);
      } else {
        getEndChildren(nav.children, endChildren);
      }
    });
    return generateMatch(endChildren);
  };
  var generateMatch = function (endChildren) {
    ng.forEach(endChildren, function (child) {
      if (ng.isUndefined(child.match) && child.url != null) {
        child.match = child.url.replace('#', '');
      }
    });
    return endChildren;
  };
  var selectPath = function (scope, path) {
    clearSelected(scope.navigation);
    var endChildren = getEndChildren(scope.navigation);
    for (var i = 0; i < endChildren.length; i++) {
      var regexp = new RegExp('^' + endChildren[i].match + '$', ['i']);
      if (regexp.test(path)) {
        scope.select(endChildren[i]);
        break;
      }
    }
  };
  var select = function ($timeout, elem, nav) {
    nav.selected = true;
    if (nav.level == 2) {
      this.setSideMenu(nav.children, nav.name);
    } else if (nav.level == 4) {
      $timeout(function () {
        var collapse = elem.find('.side-nav-menu').find('.active>.has-sub-menu').parent('li').find('ul');
        collapse.show();
      });
    }
    if (nav.parentNav != null) {
      this.select(nav.parentNav);
    }
  };
  var isSelected = function (item) {
    return item.selected ? true : false;
  };
  var setSideMenu = function (elem, menu, name) {
    if (menu == null || menu.length == 0) {
      this.hasSideMenu = false;
    } else {
      this.hasSideMenu = true;
      this.sideMenuName = name;
      this.menu = menu;
    }
  };
  var toggleSubMenu = function (e) {
    this.isSubMenuShow = !this.isSubMenuShow;
  };
  var clearSelected = function (item) {
    for (var i = 0; i < item.length; i++) {
      item[i].selected = false;
      if (item[i].children != null) {
        clearSelected(item[i].children);
      }
    }
  };
  var selectNav = function (nav) {
    clearSelected(this.navigation);
    if (nav.url != null) {
      selectPath(this, nav.url.replace('#', ''));
    } else {
      this.select(nav);
    }
    this.setSideMenu(nav.children, nav.name);
  };
  var selectMenu = function (menu, evt) {
    if (menu.children != null) {
      ng.element(evt.target).parent('li').find('ul').toggle();
    } else {
      clearSelected(this.menu);
      if (menu.url != null) {
        selectPath(this, menu.url.replace('#', ''));
      } else {
        this.select(menu);
      }
    }
  };
  var AdminuiFrameProvider = function () {
    this.config = {
      defaultShowSubmenu: false,
      showMessageBox: false
    };
    this.$get = function () {
      return this.config;
    };
    this.setConfig = function (config) {
      this.config = ng.extend(this.config, config);
    };
  };
  ng.module('ntd.directives').provider('adminuiFrame', [AdminuiFrameProvider]);
  ng.module('ntd.directives').directive('adminuiFrame', [
    'adminuiFrame',
    '$rootScope',
    '$location',
    '$timeout',
    AdminuiFrame
  ]);
}(angular));
(function () {
  'use strict';
  var fieldsets, showFilterBtn, primaryFieldset, secondaryFieldset, template = '<div class="advance-search-filter">' + '<div ng-transclude></div>' + '<div class="more">' + '<a data-class="J_toggleShowFilterBtn">' + '<i class="glyphicon glyphicon-chevron-down"></i>' + '</a>' + '</div>' + '</div>';
  function initAdvanceFilter(elem, attrs) {
    $(':submit', elem).clone().appendTo(primaryFieldset);
    primaryFieldset.addClass('skeleton');
    secondaryFieldset.hide();
    elem.bind('click', toggleFilterAction);
    if (attrs.advanceFilter === 'opened') {
      $('a[data-class="J_toggleShowFilterBtn"]').trigger('click');
    }
  }
  function toggleFilter(filterElem, elem) {
    primaryFieldset.toggleClass('skeleton').fadeIn();
    secondaryFieldset.animate({
      height: [
        'toggle',
        'swing'
      ],
      opacity: [
        'toggle',
        'swing'
      ]
    }, 200, 'linear');
    primaryFieldset.find(':submit').toggle();
    if ($('.glyphicon', elem).hasClass('glyphicon-chevron-down')) {
      $('.glyphicon.glyphicon-chevron-down', elem).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    } else {
      $('.glyphicon.glyphicon-chevron-up', elem).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    }
  }
  function toggleFilterAction(e, elem) {
    var et = e.target;
    if (($(et).attr('data-class') || $(et).parent().attr('data-class')) === showFilterBtn) {
      toggleFilter(elem);
    }
  }
  function advanceFilterDirective() {
    return {
      restrict: 'A',
      template: template,
      transclude: true,
      link: function (scope, element, attrs) {
        fieldsets = $(element).find('fieldset'), showFilterBtn = 'J_toggleShowFilterBtn', primaryFieldset = fieldsets.eq(0), secondaryFieldset = fieldsets.not(fieldsets.eq(0));
        initAdvanceFilter(element, attrs);
      }
    };
  }
  angular.module('ntd.directives').directive('advanceFilter', [advanceFilterDirective]);
}());
(function () {
  'use strict';
  function confirmButtonDirective($document, $parse) {
    return {
      restrict: 'A',
      scope: '@',
      link: function (scope, element, attrs) {
        var buttonId, html, message, nope, title, yep, pos;
        buttonId = Math.floor(Math.random() * 10000000000);
        attrs.buttonId = buttonId;
        message = attrs.message || '';
        yep = attrs.yes || '\u786e\u5b9a';
        nope = attrs.no || '\u53d6\u6d88';
        title = attrs.title || '\u786e\u8ba4\u5220\u9664?';
        pos = attrs.position || 'top';
        html = '<div id="button-' + buttonId + '">' + '<p ng-show="test" class="confirmbutton-msg">' + message + '</p>' + '<button type="button" class="confirmbutton-yes btn btn-primary">' + yep + '</button>\n' + '<button type="button" class="confirmbutton-no btn btn-default">' + nope + '</button>' + '</div>';
        element.popover({
          content: html,
          html: true,
          placement: pos,
          trigger: 'manual',
          title: title
        });
        return element.bind('click', function (e) {
          var dontBubble, pop;
          dontBubble = true;
          e.stopPropagation();
          if (element.hasClass('disabled')) {
            return false;
          } else {
            element.addClass('disabled');
          }
          $('[id^="button-"]').closest('.popover').hide().prev().removeClass('disabled');
          element.popover('show');
          pop = $('#button-' + buttonId);
          pop.closest('.popover').click(function (e) {
            if (dontBubble) {
              e.stopPropagation();
            }
          });
          pop.find('.confirmbutton-yes').click(function (e) {
            dontBubble = false;
            var func = $parse(attrs.confirmButton);
            func(scope);
          });
          pop.find('.confirmbutton-no').click(function (e) {
            dontBubble = false;
            $document.off('click.confirmbutton.' + buttonId);
            element.popover('hide');
            element.removeClass('disabled');
          });
          $document.on('click.confirmbutton.' + buttonId, ':not(.popover, .popover *)', function () {
            $document.off('click.confirmbutton.' + buttonId);
            element.popover('hide');
            element.removeClass('disabled');
          });
        });
      }
    };
  }
  angular.module('ntd.directives').directive('confirmButton', [
    '$document',
    '$parse',
    confirmButtonDirective
  ]);
}());
function DatepickerDemoCtrl($scope, $timeout) {
  $scope.today = function () {
    $scope.dt = new Date();
  };
  $scope.today();
  $scope.showWeeks = true;
  $scope.toggleWeeks = function () {
    $scope.showWeeks = !$scope.showWeeks;
  };
  $scope.clear = function () {
    $scope.dt = null;
  };
  $scope.disabled = function (date, mode) {
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  };
  $scope.toggleMin = function () {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();
  $scope.open = function () {
    $timeout(function () {
      $scope.opened = true;
    });
  };
  $scope.dateOptions = {
    'year-format': '\'yy\'',
    'starting-day': 1
  };
  $scope.formats = [
    'dd-MMMM-yyyy',
    'yyyy/MM/dd',
    'shortDate'
  ];
  $scope.format = $scope.formats[0];
}
;
var TimepickerDemoCtrl = function ($scope) {
  $scope.mytime = new Date();
  $scope.hstep = 1;
  $scope.mstep = 15;
  $scope.options = {
    hstep: [
      1,
      2,
      3
    ],
    mstep: [
      1,
      5,
      10,
      15,
      25,
      30
    ]
  };
  $scope.ismeridian = true;
  $scope.toggleMode = function () {
    $scope.ismeridian = !$scope.ismeridian;
  };
  $scope.update = function () {
    var d = new Date();
    d.setHours(14);
    d.setMinutes(0);
    $scope.mytime = d;
  };
  $scope.changed = function () {
    console.log('Time changed to: ' + $scope.mytime);
  };
  $scope.clear = function () {
    $scope.mytime = null;
  };
};
(function () {
  'use strict';
  function easyPieChartDirective($timeout) {
    return {
      restrict: 'A',
      scope: { item: '=easyPieChart' },
      replace: true,
      template: '<div class="easy-pie-chart-widget">' + '<div class="easy-pie-chart">' + '<div class="percentage" data-percent="{{item.percent}}">{{item.usage}}</div>' + '<div>{{item.caption}}</div>' + '</div>' + '</div>',
      link: function (scope, element, attrs) {
        var colorRange = [
            '#08c',
            '#e7912a',
            '#bacf0b',
            '#4ec9ce',
            '#ec7337',
            '#f377ab'
          ], lineWidth = attrs.easyPieChartLineWidth || 12, size = attrs.easyPieChartSize || 100, barColor = colorRange[scope.$parent.$index % 6] || '#08c', options = {
            'animate': 2000,
            'scaleColor': false,
            'lineWidth': lineWidth,
            'lineCap': 'square',
            'size': size,
            'barColor': barColor,
            'trackColor': '#e5e5e5'
          }, render_easy_pie_chart = function () {
            $('.percentage ', element).easyPieChart(options);
          };
        attrs.$observe('easyPieChart', render_easy_pie_chart);
        scope.$watch('item', function (newValue, oldValue) {
          if (newValue != oldValue) {
            $('.percentage ', element).data('easyPieChart').update(newValue.percent);
          }
        }, true);
      }
    };
  }
  angular.module('ntd.directives').directive('easyPieChart', [
    '$timeout',
    easyPieChartDirective
  ]);
}());
(function () {
  'use strict';
  function fooTableDirective() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $(element).addClass('footable').footable();
      }
    };
  }
  angular.module('ntd.directives').directive('fooTable', [fooTableDirective]);
}());
'use strict';
angular.module('ntd.directives').directive('nanoScrollbar', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var wrapper = '<div class="span2 affix"><div class="nano"><div class="content"></div></div></div>';
        $(element).children().wrap(wrapper);
        function initNanoScrollBar() {
          var config = {
              height: function () {
                return $(window).width() < 767 ? 200 : $(window).height() - 80;
              },
              showScrollBar: function () {
                return $(window).width() < 767 ? true : false;
              }
            };
          $('.nano', element).css({ 'height': config.height() }).nanoScroller({
            preventPageScrolling: true,
            iOSNativeScrolling: true,
            alwaysVisible: config.showScrollBar()
          });
        }
        attrs.$observe('nanoScrollbar', initNanoScrollBar);
        $(element).on('click', function () {
          $timeout(initNanoScrollBar, 200);
        });
        $(window).bind('load resize', initNanoScrollBar);
      }
    };
  }
]);
(function () {
  'use strict';
  function labelStateDirective() {
    return {
      restrict: 'A',
      transclude: true,
      scope: { tips: '@labelState' },
      template: '<span ng-transclude></span>' + '<i tooltip-popup-delay="300" ' + 'tooltip="{{tips}}" class="glyphicon glyphicon-question-sign"></i>'
    };
  }
  angular.module('ntd.directives').directive('labelState', [labelStateDirective]);
}());
(function () {
  'use strict';
  function navBarDirective($location) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs, controller) {
        scope.$watch(function () {
          return $location.path();
        }, function (newValue, oldValue) {
          $('li[data-match-route]', element).each(function (k, li) {
            var $li = angular.element(li), pattern = $li.attr('data-match-route'), regexp = new RegExp('^' + pattern + '$', ['i']);
            if (regexp.test(newValue)) {
              $li.addClass('active');
              if ($li.find('ul').length) {
                $li.addClass('opened').find('ul').show();
              }
            } else {
              $li.removeClass('active');
            }
          });
        });
      }
    };
  }
  angular.module('ntd.directives').directive('navBar', [
    '$location',
    navBarDirective
  ]);
}());
(function () {
  'use strict';
  function toggle_menuClass() {
    $('#J_subMenu').parent().toggle();
    $('#J_mainContent').toggleClass('col-md-12');
  }
  function toggleSubmenuDirectice() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          $(this).bind('selectstart', function () {
            return false;
          });
          $(this).parent().toggleClass('active');
          toggle_menuClass();
        });
      }
    };
  }
  angular.module('ntd.directives').directive('toggleSubmenu', [toggleSubmenuDirectice]);
}());
(function () {
  'use strict';
  function subTreemenuDirective() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs, cookieStore) {
        element.on('click', function (event) {
          var et = event.target;
          if (et.nodeName.toLowerCase() === 'a' && $(et).next('ul').length) {
            $(et).next('ul').slideToggle('fast');
            $(et).parent().toggleClass('opened');
            $(et).bind('selectstart', function () {
              return false;
            });
          } else {
            var url = $(et).attr('href');
            $('#bs3').attr('href', 'http://ec3s.github.io/adminui-3.0/' + url);
          }
        });
      }
    };
  }
  angular.module('ntd.directives').directive('subTreemenu', [subTreemenuDirective]);
}());
(function () {
  'use strict';
  function ntdPieDirective() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var id = '#' + attrs.id;
        var data = scope[attrs.data].analysis;
        var width = attrs.pieWidth || 800, height = attrs.pieHeight || 300, radius = Math.min(width, height) / 2;
        var color = d3.scale.ordinal().range([
            '#fdc79b',
            '#ee6962',
            '#5d96b1',
            '#b8d97e',
            '#24CBE5',
            '#64E572',
            '#FF9655',
            '#FFF263'
          ]);
        var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
        var pie = d3.layout.pie().sort(null).value(function (d) {
            return d.value;
          });
        var svg = d3.select(id).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
        var g = svg.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');
        g.append('path').attr('d', arc).style('fill', function (d) {
          return color(d.data.name);
        });
        g.append('text').attr('transform', function (d) {
          return 'translate(' + arc.centroid(d) + ')';
        }).attr('dy', '.35em').style('text-anchor', 'middle').text(function (d) {
          return d.data.name;
        });
        var legend = svg.selectAll('.legend').data(color.domain().slice().reverse()).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
            return 'translate(0,' + i * 20 + ')';
          });
        legend.append('rect').attr('x', width - 430).attr('width', 18).attr('height', 18).style('fill', color);
        legend.append('text').attr('x', width - 440).attr('y', 9).attr('dy', '.35em').style('text-anchor', 'end').text(function (d) {
          return d;
        });
      }
    };
  }
  angular.module('ntd.directives').directive('ntdPie', [ntdPieDirective]);
}());
(function () {
  'use strict';
  function loadingButtonDirective() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(function () {
          return scope.$eval(attrs.loadingButton);
        }, function (value) {
          if (value) {
            if (!attrs.hasOwnProperty('ngDisabled')) {
              element.addClass('disabled').attr('disabled', 'disabled');
            }
            element.data('resetText', element.html());
            element.html(element.data('loading-text'));
          } else {
            if (!attrs.hasOwnProperty('ngDisabled')) {
              element.removeClass('disabled').removeAttr('disabled');
            }
            element.html(element.data('resetText'));
          }
        });
      }
    };
  }
  angular.module('ntd.directives').directive('loadingButton', [loadingButtonDirective]);
}());
(function () {
  'use strict';
  var element;
  function getCurrentWindowH() {
    return $(window).width() < 767 ? 200 : $(window).height() - 80;
  }
  function initSlimScroll() {
    $('.slimScroll', element).parent('.slimScrollDiv').css({ 'height': getCurrentWindowH() + 'px' });
    $('.slimScroll', element).css({ 'height': getCurrentWindowH() + 'px' }).slimscroll({ distance: '2px' });
  }
  function slimScrollDirective($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        if (attrs.slimScrollMenu == 'yes') {
          var wrapper = '<div class="col-md-2 affix">' + '<div class="slimScroll"></div>' + '</div>';
          $(element).children().wrap(wrapper);
          attrs.$observe('slimScroll', initSlimScroll);
          $(element).on('click', function () {
            $timeout(initSlimScroll, 200);
          });
          $(window).bind('load resize', initSlimScroll);
        } else {
          $(element).slimscroll({
            width: attrs.slimScrollWidth || 'auto',
            height: attrs.slimScrollHeight || '250px',
            size: attrs.slimScrollSize || '7px',
            color: attrs.slimScrollColor || '#000',
            position: attrs.slimScrollPosition || 'right',
            distance: attrs.slimScrollDistance || '1px',
            start: 'top',
            opacity: 0.4,
            alwaysVisible: false,
            disableFadeOut: false,
            railVisible: false,
            railColor: attrs.slimScrollRailColor || '#333',
            railOpacity: 0.2,
            railDraggable: true,
            railClass: 'slimScrollRail',
            barClass: 'slimScrollBar',
            wrapperClass: 'slimScrollDiv',
            allowPageScroll: false,
            wheelStep: 20,
            touchScrollStep: 200
          });
        }
      }
    };
  }
  angular.module('ntd.directives').directive('slimScroll', [
    '$timeout',
    slimScrollDirective
  ]);
}());
(function () {
  'use strict';
  var $element, $tree, $scope;
  function createList(parent) {
    var parentItem = getItem(parent);
    var currItem = getItem($scope.ngModel);
    var level = parentItem ? parentItem.level + 1 : 0;
    var list = $('<ul></ul>').css('margin-left', level * 30 + '%').attr('cl-id', parent);
    angular.forEach($tree, function (item) {
      if (item.parent == parent) {
        var li = $('<li cl-value="' + item.value + '">' + item.text + '</li>').click(onItemClick);
        if (item.children().length > 0) {
          li.addClass('has-child');
        }
        if (item.value == $scope.ngModel) {
          list.addClass('selective');
        }
        if (currItem && currItem.path.indexOf('' + item.value) > -1) {
          li.addClass('selective');
        }
        list.append(li);
      }
    });
    return list;
  }
  function onItemClick(e) {
    var item = $(e.target).addClass('selective');
    var parent = item.parent().addClass('selective');
    var parentId = item.attr('cl-value');
    parent.nextAll('ul').remove();
    item.prevAll('.selective').removeClass('selective');
    item.nextAll('.selective').removeClass('selective');
    parent.prevAll('.selective').removeClass('selective');
    if (item.hasClass('has-child')) {
      var list = createList(parentId);
      $element.append(list);
      var pos = $element.offset().left + $element.width() * 2 / 3;
      if (e.clientX > pos) {
        $element.scrollLeft(parent.prev().offset().left);
      }
    }
    setValue(parentId);
  }
  function getItem(id) {
    var ret = $tree.filter(function (em, idx, arr) {
        return em.value == id;
      });
    return ret[0];
  }
  function setValue(val) {
    $scope.ngModel = val;
    $scope.$apply();
  }
  function initList(val) {
    $element.html('');
    if ($tree == undefined || $tree.length == 0) {
      return;
    }
    var parent = $scope.ngModel;
    var item = getItem(parent);
    parent = item ? item.children().length > 0 ? item.value : item.parent : 0;
    do {
      $element.prepend(createList(parent));
      var item = getItem(parent);
      parent = item ? item.parent : 0;
    } while (item);
    var ul = $element.find('ul.selective');
    if (ul.length > 0) {
      var left = $element.parent().offset().left + $element.parent().width() * 2 / 3;
      if (ul.offset().left > left) {
        $element.scrollLeft(ul.prev().offset().left);
      }
    }
  }
  var TreeData = function (data, options) {
    var ret = [];
    angular.forEach(data, function (item) {
      var path = item[options.path].split('/').slice(1, -1);
      ret.push({
        value: item[options.value],
        text: item[options.text],
        parent: item[options.parent],
        path: path,
        level: path.length - 1,
        children: function () {
          var val = this.value;
          var son = data.filter(function (em, idx, arr) {
              return em[options.parent] == val;
            });
          return son;
        }
      });
    });
    return ret;
  };
  function cascadeListDirective($parse) {
    return {
      restrict: 'ACE',
      replace: false,
      scope: {
        'ngModel': '=',
        'data': '='
      },
      link: function (scope, element, attrs) {
        $scope = scope;
        $element = $('<div class="cascade-list-inner"></div>').css('width', attrs.width || '100%').css('height', attrs.height || '220px');
        element.append($element).addClass('cascade-list');
        var options = {
            name: attrs.name,
            parent: attrs.parent || 'parent',
            value: attrs.value || 'id',
            text: attrs.text || 'name',
            path: attrs.path || 'path'
          };
        scope.$watch('data', function (val, old) {
          $tree = new TreeData(val, options);
          initList($tree);
        });
        scope.$watch('ngModel', function (val, old) {
          if (val != old) {
            initList();
          }
        });
      }
    };
  }
  angular.module('ntd.directives').directive('cascadeList', [
    '$parse',
    cascadeListDirective
  ]);
}());
(function (app, ng) {
  'use strict';
  var Chosen = function ($parse, $timeout) {
    return {
      restrict: 'AC',
      link: function (scope, elem, attrs) {
        var ngOptions = attrs.ngOptions || null;
        var ngModelName = attrs.ngModel || null;
        var onSearch = attrs.onSearchPromise || null;
        var optionsNode = attrs.optionsNode || null;
        var multiple = attrs.multiple || null;
        var oldSearch = '';
        var initOptions;
        var disableSearchThreshold = attrs.disableSearchThreshold || 0;
        var allowSingleDeselect = attrs.allowSingleDeselect || false;
        allowSingleDeselect = allowSingleDeselect == 'true' ? true : false;
        var options = { disable_search_threshold: disableSearchThreshold };
        var chosenEl = elem.chosen(options);
        var chosen = chosenEl.data('chosen');
        chosen.container.css('max-width', chosenEl.css('width'));
        var selected_options = {};
        var searchTxt = scope.$new(false);
        if (onSearch) {
          chosen.winnow_results = function () {
            this.no_results_clear();
            var searchText = this.get_search_text();
            var results_data = this.results_data;
            var option_number = 0;
            for (var i = 0; i < results_data.length; i++) {
              var option = results_data[i];
              if (!option.empty) {
                option_number++;
                option.search_match = true;
                option.search_text = option.group ? option.label : option.html;
              }
            }
            if (option_number <= 0) {
              this.update_results_content('');
              this.result_clear_highlight();
              return this.no_results(searchText);
            } else {
              this.update_results_content(this.results_option_build());
              return this.winnow_results_set_highlight();
            }
          };
          chosen.show_search_field_default = function () {
            if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
              this.search_field.val(this.default_text);
              return this.search_field.addClass('default');
            } else {
              return this.search_field.removeClass('default');
            }
          };
        }
        chosen.allow_single_deselect = allowSingleDeselect;
        if (ngOptions) {
          var optionsModelName = ngOptions.split(' ').pop();
          var optionsModelGetter = $parse(optionsModelName);
          var optionsModelSetter = optionsModelGetter.assign;
          scope.$watch(optionsModelName, function (newValue, oldValue) {
            chosenEl.trigger('liszt:data_loaded', {
              options: newValue,
              optionsModelName: optionsModelName
            });
          }, true);
        }
        if (ngModelName) {
          scope.$watch(ngModelName, function (newValue, oldValue) {
            if (multiple) {
              ng.forEach(newValue, function (value) {
                if (!selected_options[value]) {
                  ng.forEach(optionsModelGetter(scope), function (item, index) {
                    if (item.id == value) {
                      selected_options[value] = optionsModelGetter(scope)[index];
                    }
                  });
                }
              });
            }
            if (newValue !== oldValue) {
              elem.trigger('liszt:updated');
            }
          }, true);
        }
        chosenEl.bind('liszt:hiding_dropdown', function (e) {
          if (!chosen.active_field && ng.isArray(initOptions)) {
            optionsModelSetter(scope, initOptions);
            searchTxt.$search = '';
            searchTxt.$apply();
            $timeout(function () {
              chosenEl.trigger('liszt:updated');
              chosen.search_field.val(searchTxt.$search);
            });
          } else if (chosen.active_field) {
            initOptions = optionsModelGetter(scope);
          }
        });
        chosenEl.bind('liszt:showing_dropdown', function (e, data) {
          if (onSearch) {
            if (!searchTxt.$search) {
              $timeout(function () {
                chosen.search_results.find('.no-results').text('\u8bf7\u8f93\u5165\u5173\u952e\u5b57...');
              });
              return;
            }
            if (!multiple) {
              chosen.search_field.val(searchTxt.$search);
            }
            chosenEl.trigger('liszt:load_data', {
              onSearch: onSearch,
              optionsModelName: optionsModelName,
              needRecord: true
            });
          }
        });
        chosenEl.bind('liszt:load_data', function (e, data) {
          var promise = searchTxt.$eval(data.onSearch);
          chosen.search_field.addClass('loading');
          chosen.search_results.find('.no-results').text('\u52a0\u8f7d\u4e2d...');
          promise.then(function (result) {
            var options = [];
            if (optionsNode) {
              options = result[optionsNode];
            } else {
              options = result;
            }
            if (!ng.isArray(options)) {
              options = [];
            }
            if (data.needRecord && !initOptions) {
              initOptions = options;
            }
            chosenEl.trigger('liszt:data_loaded', {
              options: options,
              optionsModelName: data.optionsModelName
            });
          });
        });
        chosenEl.bind('liszt:data_loaded', function (e, data) {
          if (onSearch) {
            chosen.search_field.removeClass('loading');
            if (ng.isArray(data.options) && data.options.length > 0) {
              if (!initOptions) {
                initOptions = data.options;
              }
              optionsModelSetter(scope, data.options);
            } else {
              optionsModelSetter(scope, []);
            }
            if (multiple) {
              ng.forEach(selected_options, function (selectedOption) {
                var hasOption = false;
                ng.forEach(optionsModelGetter(scope), function (option) {
                  if (option.id == selectedOption.id) {
                    hasOption = true;
                    return;
                  }
                });
                if (!hasOption) {
                  var options = optionsModelGetter(scope);
                  options.push(selectedOption);
                  if (ng.isArray(options)) {
                    optionsModelSetter(scope, options);
                  }
                }
              });
            }
          }
          $timeout(function () {
            chosenEl.trigger('liszt:updated');
            if (!searchTxt.$search) {
              chosen.search_results.find('.no-results').text('\u8bf7\u8f93\u5165\u5173\u952e\u5b57...');
            }
          });
        });
        if (onSearch && optionsModelName) {
          chosen.search_field.bind('keyup', function (e) {
            if (chosen && chosen.results_showing) {
              searchTxt.$search = chosen.get_search_text();
              $timeout(function () {
                if (oldSearch != searchTxt.$search) {
                  oldSearch = searchTxt.$search;
                  chosenEl.trigger('liszt:load_data', {
                    onSearch: onSearch,
                    optionsModelName: optionsModelName
                  });
                }
              }, 500);
            }
          });
        }
        chosenEl.change(function (e) {
          elem.trigger('liszt:updated');
        });
      }
    };
  };
  var Linkage = function ($parse) {
    return {
      restrict: 'AC',
      template: '<span><span' + ' data-ng-repeat="linkage in linkages">' + ' <select class="col-sm-3" data-ntd-chosen' + ' data-placeholder="\u8bf7\u9009\u62e9"' + ' data-disable-search-threshold="10"' + ' data-ng-change="change($index)"' + ' data-ng-model="values[$index]"' + ' data-allow-single-deselect="true"' + ' data-ng-options="option as option.name' + ' for option in linkage">' + ' <option value=""></option>' + '</select></span></span>',
      scope: {
        source: '=',
        ngModel: '='
      },
      link: function (scope, elem, attrs) {
        var baseLevels;
        scope.$watch('source', function (value, oldValue) {
          if (!ng.isArray(scope.ngModel)) {
            scope.ngModel = [];
          }
          initOptions();
          changeSelect();
        });
        var initOptions = function () {
          baseLevels = [];
          scope.values = [];
          scope.linkages = [];
          ng.forEach(scope.source, function (item) {
            baseLevels.push(item);
          });
          scope.linkages.push(baseLevels);
        };
        var changeSelect = function () {
          if (scope.ngModel.length > 0) {
            ng.forEach(scope.ngModel, function (id, index) {
              ng.forEach(scope.linkages[index], function (item) {
                if (item.id == id) {
                  scope.values[index] = item;
                  scope.change(index);
                }
              });
            });
          } else {
            scope.values[0] = '';
            scope.change(0);
          }
        };
        scope.change = function (index) {
          var tmpLevels = [];
          var level = scope.linkages.length - 1;
          var offset = scope.values[index];
          var values = [];
          if (!offset) {
            scope.linkages.splice(index + 1, level - index);
            scope.values.splice(index + 1, level - index);
          } else {
            if (offset.children) {
              ng.forEach(offset.children, function (item) {
                tmpLevels.push(item);
              });
            }
            if (level <= index && tmpLevels.length > 0) {
              scope.linkages.push(tmpLevels);
            } else if (index < level) {
              scope.linkages.splice(index + 1, level - index);
              scope.values.splice(index + 1, level - index);
              if (tmpLevels.length > 0) {
                scope.linkages[index + 1] = tmpLevels;
              }
            }
          }
          $(scope.values).each(function (index, item) {
            if (!!item == true && !!item.id == true) {
              values.push(item.id);
            }
          });
          scope.ngModel = values;
        };
      }
    };
  };
  app.directive('ntdChosen', [
    '$parse',
    '$timeout',
    Chosen
  ]);
  app.directive('ntdLinkage', [
    '$parse',
    Linkage
  ]);
}(angular.module('ntd.directives'), angular));
(function () {
  'use strict';
  function tagInputDirective() {
    return {
      restrict: 'AC',
      replace: true,
      scope: {
        tags: '=ngModel',
        placeholder: '@',
        id: '@'
      },
      template: '<div class="tag-input-container">' + '<ul data-ng-class="{true: \'focus\'}[isFocus]">' + '<li class="tag" data-ng-repeat="tag in tags">' + '<span>{{tag.name}}</span>' + '<i data-ng-show="tagsAttribute[$index].editable"' + ' class="glyphicon glyphicon-pencil"' + ' data-ng-click="editTag($index, $event)"></i>' + ' <i data-ng-show="tagsAttribute[$index].deletable"' + ' data-ng-click="removeTag($index)"' + ' class="glyphicon glyphicon-remove"></i></li><li class="input-li">' + '<input id="{{id}}" class="form-control input-sm"' + ' data-ng-model="tagInput"' + ' placeholder="{{placeholder}}" type="text" autocomplete="false" />' + '</li>' + '</ul>' + '</div>',
      link: function (scope, elem, attrs) {
        var placeholder = attrs.placeholder;
        var caseSensitive = attrs.caseSensitive || false;
        var allwaysPlaceholder = scope.$eval(attrs.allwaysPlaceholder) || false;
        var unique = scope.$eval(attrs.unique) || true;
        var uniqueTags = [];
        var oldInput;
        var tagsAttribute = scope.tagsAttribute = [];
        var getPopHtml = function (index) {
          return '<div id="pop_' + index + '" >' + '<p><input id="pop_inp_' + index + '"' + ' type="text" class="form-control input-sm"/></p>' + ' <button type="button"' + ' class="btn btn-primary btn-sm">' + ' \u786e\u5b9a</button>\n<button type="button"' + ' class="btn btn-default btn-sm">' + ' \u53d6\u6d88</button>' + '</div>';
        };
        var cancelEdit = function (index) {
          return function (e) {
            angular.element(elem.find('li')[index]).popover('destroy');
            elem.find('input').focus();
          };
        };
        var useEdit = function (index) {
          return function (e) {
            var tagName = elem.find('#pop_inp_' + index).val();
            var findIndex = indexOf(scope.tags, { 'name': tagName });
            if (!unique || findIndex === -1) {
              scope.tags[index].name = tagName;
              scope.$apply();
            } else {
              angular.element(elem.find('li')[findIndex]).fadeTo('fast', 0.2).fadeTo('fast', 1);
            }
            angular.element(elem.find('li')[index]).popover('destroy');
            elem.find('input').focus();
          };
        };
        var closeAllPop = function () {
          elem.find('li').each(function (index, item) {
            angular.element(item).popover('destroy');
          });
        };
        var isDeletable = function (tag) {
          return angular.isUndefined(tag.deletable) || tag.deletable;
        };
        var isEditable = function (tag) {
          return !angular.isUndefined(tag.editable) && tag.editable;
        };
        var setTagAttribute = function (tag, index) {
          if (!angular.isObject(tagsAttribute[index])) {
            tagsAttribute[index] = {
              'deletable': isDeletable(tag) ? true : false,
              'editable': isEditable(tag) ? true : false
            };
          }
          delete tag.deletable;
          delete tag.editable;
        };
        var unifyItemInTags = function (tags) {
          angular.forEach(tags, function (tag, index) {
            if (angular.isString(tag)) {
              tags[index] = { 'name': tag };
            }
            setTagAttribute(tags[index], index);
          });
        };
        unifyItemInTags(scope.tags);
        var indexOf = function (tags, tag) {
          if (!caseSensitive) {
            var tagName = tag.name.toLowerCase();
            var allNames = tags.map(function (tag) {
                return tag.name.toLowerCase();
              });
          }
          return allNames.indexOf(tagName);
        };
        if (!angular.isArray(scope.tags)) {
          scope.tags = [];
        }
        if (unique) {
          angular.forEach(scope.tags, function (tag) {
            if (indexOf(uniqueTags, tag) === -1) {
              uniqueTags.push(tag);
            }
          });
          scope.tags = uniqueTags;
        }
        scope.removeTag = function (index) {
          closeAllPop();
          scope.tags.splice(index, 1);
          tagsAttribute.splice(index, 1);
        };
        scope.editTag = function (index, event) {
          event.stopPropagation();
          closeAllPop();
          angular.element(elem.find('li')[index]).popover({
            content: getPopHtml(index),
            html: true,
            placement: 'top',
            trigger: 'manual',
            title: '\u4fee\u6539'
          });
          angular.element(elem.find('li')[index]).popover('show');
          elem.find('#pop_inp_' + index).focus().bind('keypress', function (e) {
            if (e.keyCode == 13) {
              e.preventDefault();
              useEdit(index)(e);
            }
          }).val(scope.tags[index].name);
          elem.find('#pop_' + index).find('.btn-primary').bind('click', useEdit(index));
          elem.find('#pop_' + index).find('.btn-default').bind('click', cancelEdit(index));
          elem.find('.popover').bind('click', function (e) {
            e.stopPropagation();
          });
        };
        var addTag = function (tag) {
          scope.tags.push(tag);
          tagsAttribute.push({
            'deletable': true,
            'editable': false
          });
        };
        elem.find('input').bind('focus', function () {
          scope.isFocus = true;
          scope.$apply();
        });
        elem.find('input').bind('blur', function () {
          scope.isFocus = false;
          var oldValue = $(this).val();
          if (oldValue) {
            var tag = { 'name': oldValue };
            var index = indexOf(scope.tags, tag);
            if (!unique || index === -1) {
              addTag(tag);
            } else {
              angular.element(elem.find('li')[index]).fadeTo('fast', 0.2).fadeTo('fast', 1);
            }
          }
          scope.tagInput = '';
          if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
            scope.$apply();
          }
        });
        elem.bind('click', function (e) {
          closeAllPop();
          elem.find('input').focus();
        });
        elem.find('input').bind('keyup', function (e) {
          if (oldInput != scope.tagInput) {
            oldInput = scope.tagInput;
          } else if (e.keyCode == 8 && scope.tags.length > 0) {
            if (oldInput == scope.tagInput) {
              var tagAttribute = tagsAttribute[scope.tags.length - 1];
              if (tagAttribute.deletable === true) {
                scope.removeTag(scope.tags.length - 1);
                scope.$apply();
              } else {
                angular.element(elem.find('li')[scope.tags.length - 1]).stop().fadeTo('fast', 0.2).fadeTo('fast', 1);
              }
            }
          }
        });
        scope.$watch('tags', function (newValue, oldValue) {
          unifyItemInTags(newValue);
          if (!allwaysPlaceholder) {
            if (angular.isArray(newValue) && newValue.length > 0) {
              elem.find('input').attr('placeholder', '');
            } else {
              elem.find('input').attr('placeholder', placeholder);
            }
          }
        }, true);
        scope.$watch('tagInput', function (newValue, oldValue) {
          if (newValue != oldValue) {
            var lastChar = newValue.substr(-1, 1);
            if (lastChar == ';' || lastChar == '\uff1b') {
              if (oldValue) {
                var tag = { 'name': oldValue };
                var index = indexOf(scope.tags, tag);
                if (!unique || index === -1) {
                  addTag(tag);
                } else {
                  angular.element(elem.find('li')[index]).fadeTo('fast', 0.2).fadeTo('fast', 1);
                }
              }
              scope.tagInput = '';
            }
          }
        });
      }
    };
  }
  angular.module('ntd.directives').directive('tagInput', [tagInputDirective]);
}());
(function () {
  'use strict';
  function fieldErrorDirective() {
    return {
      template: '<span class="text-danger" ng-show="showError" ng-transclude></span>',
      restrict: 'EAC',
      transclude: true,
      scope: { 'for': '=' },
      link: function (scope) {
        scope.$watch('{v: for.$invalid, d: for.$dirty}| json', function (v, ov) {
          v = JSON.parse(v);
          scope.showError = v.v && v.d;
        });
      }
    };
  }
  angular.module('ntd.directives').directive('fieldError', [fieldErrorDirective]);
}());
(function () {
  'use strict';
  var msgObj = {
      'info': 'alert-info',
      'error': 'alert-danger',
      'success': 'alert-success',
      'warning': 'alert-warning'
    };
  function buildHtml(message) {
    var noticeHtml = '<div class="alert ' + msgObj[message.state] + '">' + '<strong>' + message.info + '</strong>' + '<button type="button" class="close">\xd7</button>' + '</div>';
    return noticeHtml;
  }
  function noticeDirective($rootScope, $location, $timeout) {
    return {
      restrict: 'EAC',
      replace: false,
      transclude: false,
      link: function (scope, element, attr) {
        $rootScope.$on('event:notification', function (event, message) {
          element.html(buildHtml(message));
          element.show().find('button').on('click', function () {
            element.fadeOut();
          });
          if (message.redirect_url) {
            $timeout(function () {
              $location.path(message.redirect_url);
            }, 1500);
          }
        });
        scope.$watch(function () {
          return $location.url();
        }, function () {
          element.fadeOut();
        });
      }
    };
  }
  angular.module('ntd.directives').directive('notice', [
    '$rootScope',
    '$location',
    '$timeout',
    noticeDirective
  ]);
}());
(function () {
  'use strict';
  function build_msg(type, message) {
    type = type == 'error' ? 'danger' : type;
    var html = '<div class="alert alert-' + type + '">' + message + '<button type="button" class="close">\xd7</button>' + '</div>';
    return html;
  }
  function flashAlertDirective($rootScope, $timeout) {
    return {
      scope: true,
      restrict: 'EAC',
      link: function ($scope, element, attr) {
        var html_fragement = '';
        $rootScope.$on('event:flashMessageEvent', function (event, msg) {
          if (angular.isArray(msg)) {
            angular.forEach(msg, function (item, key) {
              html_fragement += build_msg(item.state, item.info);
            });
          } else {
            html_fragement += build_msg(msg.state, msg.info);
          }
        });
        $rootScope.$on('$routeChangeSuccess', function () {
          element.empty();
          if (html_fragement) {
            element.append(html_fragement);
            $('.close', element).bind('click', function () {
              $(this).parent('.alert').fadeOut(function () {
                $(this).remove();
              });
            });
            html_fragement = '';
          }
        });
      }
    };
  }
  angular.module('ntd.directives').directive('flashAlert', [
    '$rootScope',
    '$timeout',
    flashAlertDirective
  ]);
}());
(function () {
  'use strict';
  function toggleSwitcherDirective($timeout) {
    return {
      restrict: 'AC',
      replace: true,
      scope: {
        ngTrueTitle: '@',
        ngFalseTitle: '@',
        ngTrueValue: '@',
        ngFalseValue: '@',
        ngDisabled: '=',
        id: '@',
        name: '@',
        ngModel: '=',
        ngChange: '&',
        click: '&'
      },
      template: '<label class="checkbox toggle">' + '<input id="{{id}}" name="{{name}}"' + ' type="checkbox" ng-model="checked">' + '<p>' + '<span>{{ngTrueTitle}}</span>' + '<span>{{ngFalseTitle}}</span>' + '</p>' + '<a class="btn slide-button"></a>' + '</label>',
      link: function (scope, element, attrs) {
        var trueValue = attrs.ngTrueValue ? attrs.ngTrueValue : true;
        var falseValue = attrs.ngFalseValue ? attrs.ngFalseValue : false;
        var eventModel = scope.$new(true);
        element.bind('click', function (event) {
          if (event.target.nodeName.toLowerCase() === 'input') {
            eventModel.$event = {
              originalEvent: event,
              data: scope.ngModel,
              target: element,
              type: 'click'
            };
            scope.click(eventModel);
          }
        });
        scope.$watch('checked', function (value, oldValue) {
          if (value !== oldValue) {
            scope.ngModel = value ? trueValue : falseValue;
          }
        }, true);
        scope.$watch('ngDisabled', function (value) {
          if (value) {
            element.find('input').attr('disabled', true);
            element.addClass('disabled');
          } else {
            element.find('input').attr('disabled', false);
            element.removeClass('disabled');
          }
        });
        scope.$watch('ngModel', function (value, oldValue) {
          scope.checked = value === trueValue ? true : false;
          if (value !== oldValue) {
            eventModel.$event = {
              data: {
                value: value,
                oldValue: oldValue
              },
              target: element,
              type: 'change'
            };
            scope.ngChange(eventModel);
          }
        }, true);
        $timeout(function () {
          var spanWidth = element.find('span').outerWidth();
          element.width(spanWidth * 2).find('span:last').css('left', spanWidth);
        });
      }
    };
  }
  angular.module('ntd.directives').directive('toggleSwitcher', [
    '$timeout',
    toggleSwitcherDirective
  ]);
}());
(function (ng) {
  var CheckboxGroup = function () {
    return {
      restrict: 'A',
      templateUrl: 'templates/checkbox-group.html',
      scope: { dataSource: '=ngModel' },
      link: function (scope, elem, attrs) {
        scope.status = 'none';
        scope.init = ng.bind(scope, init, elem);
        scope.watchCheckboxGroup = ng.bind(scope, watchCheckboxGroup);
        scope.toggleCheckedAll = ng.bind(scope, toggleCheckedAll);
        scope.init(elem);
        scope.watchCheckboxGroup();
      }
    };
  };
  var watchCheckboxGroup = function () {
    this.$watch('dataSource.checkboxGroup', function (value, oldValue) {
      var status = [];
      ng.forEach(value, function (checkbox) {
        if (true == Boolean(checkbox.checked)) {
          status.push(checkbox);
        }
      });
      if (status.length > 0 && status.length < this.dataSource.checkboxGroup.length) {
        this.status = 'part';
      } else if (status.length == this.dataSource.checkboxGroup.length && status.length > 0) {
        this.status = 'all';
      } else {
        this.status = 'none';
      }
    }.bind(this), true);
  };
  var toggleCheckedAll = function () {
    this.status = this.status == 'none' ? 'all' : 'none';
    ng.forEach(this.dataSource.checkboxGroup, function (checkbox) {
      checkbox.checked = this.status == 'all' ? true : false;
    }, this);
  };
  var init = function (elem) {
    var titleCheckBox = elem.find('.dropdown-toggle>input');
    var dropMenu = elem.find('.dropdown-menu');
    titleCheckBox.bind('click', function (e) {
      e.stopPropagation();
    });
    dropMenu.bind('click', function (e) {
      e.stopPropagation();
    });
  };
  ng.module('ntd.directives').directive('checkboxGroup', [CheckboxGroup]);
}(angular));
(function (ng) {
  'use strict';
  var pagination = {
      config: {
        directionLinks: true,
        previousText: '\xab',
        nextText: '\xbb',
        total: 1,
        size: 5,
        page: 1,
        pageKey: 'page',
        rotate: false
      },
      updateConfig: function (pageInfo) {
        pageInfo = ng.extend(this.config, pageInfo);
      },
      noPrevious: function () {
        return this.config.page === 1;
      },
      noNext: function () {
        return this.config.page === this.config.total;
      },
      isActive: function (page) {
        return parseInt(this.config.page) === parseInt(page);
      },
      makePage: function (number, text, isActive, isDisabled) {
        return {
          number: number,
          text: text,
          active: isActive,
          disabled: isDisabled
        };
      },
      getPages: function () {
        var pages = [];
        if (this.config.total <= 1) {
          return;
        }
        var startPage = 1, endPage = this.config.total;
        var isMaxSized = this.config.size && this.config.size < this.config.total;
        if (isMaxSized) {
          startPage = Math.max(this.config.page - Math.floor(this.config.size / 2), 1);
          endPage = startPage + this.config.size - 1;
          if (endPage > this.config.total) {
            endPage = this.config.total;
            startPage = endPage - this.config.size + 1;
          }
        }
        for (var number = startPage; number <= endPage; number++) {
          if (number == 1 || number == this.config.total) {
            continue;
          }
          var page = this.makePage(number, number, this.isActive(number), false);
          pages.push(page);
        }
        if (isMaxSized && !this.config.rotate) {
          if (startPage > 1) {
            var previousPageSet = this.makePage(startPage - 1, '...', false, false);
            pages.unshift(previousPageSet);
          }
          if (endPage < this.config.total) {
            var nextPageSet = this.makePage(endPage + 1, '...', false, false);
            pages.push(nextPageSet);
          }
        }
        var firstPage = this.makePage(1, 1, this.isActive(1), false);
        pages.unshift(firstPage);
        var lastPage = this.makePage(this.config.total, this.config.total, this.isActive(this.config.total), false);
        pages.push(lastPage);
        if (pagination.config.directionLinks) {
          var previousPage = this.makePage(this.config.page - 1, this.config.previousText, false, this.noPrevious());
          pages.unshift(previousPage);
          var nextPage = this.makePage(this.config.page + 1, this.config.nextText, false, this.noNext());
          pages.push(nextPage);
        }
        return pages;
      },
      selectPage: function ($location, page) {
        if (!this.isActive(page) && page > 0 && page <= this.config.total) {
          this.config.page = page;
          var searchOpt = $location.search();
          searchOpt[this.config.pageKey] = page;
          $location.search(searchOpt).replace();
        }
      },
      render: function ($scope) {
        $scope.pages = this.getPages();
      }
    };
  var AdminPageDirective = function ($location) {
    return {
      restrict: 'A',
      template: '<ul class="pagination">\n' + '<li ng-repeat="page in pages"' + ' ng-class="{active: page.active, disabled: page.disabled}">' + '<a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n' + '</ul>\n',
      replace: true,
      scope: { pageInfo: '=ngModel' },
      link: function (scope, element, attrs) {
        pagination.updateConfig(scope.pageInfo);
        scope.$watch('pageInfo.page', function (value) {
          pagination.render(scope);
        }, true);
        scope.selectPage = ng.bind(pagination, pagination.selectPage, $location);
      }
    };
  };
  ng.module('ntd.directives').directive('adminuiPagination', [
    '$location',
    AdminPageDirective
  ]);
}(angular));
(function (ng) {
  'use strict';
  var FinderDirective = function ($timeout) {
    return {
      'restrict': 'A',
      'templateUrl': 'templates/finder.html',
      'scope': {
        'source': '=',
        'ngModel': '='
      },
      'link': function (scope, elem, attrs) {
        var finder = new Finder(scope, $timeout, elem);
        scope.$watch('ngModel', function (value, oldValue) {
          if (finder.isClick == false && value != oldValue) {
            finder.selectItemByValue(scope, value);
          } else {
            finder.isClick = false;
          }
        });
        scope.$watch('source', function (value, oldValue) {
          if (value != oldValue) {
            finder = new Finder(scope, $timeout, elem);
          }
        }, true);
      }
    };
  };
  var Finder = function (scope, $timeout, elem) {
    this.dataSource = this.initData(scope.source);
    this.elem = elem;
    this.$timeout = $timeout;
    this.isClick = false;
    this.expandList = [];
    this.selectedItems = [];
    this.initialize(scope);
  };
  Finder.prototype.initialize = function (scope) {
    scope.finderList = this.getExpandList(null);
    this.selectItemByValue(scope, scope.ngModel);
    scope.showChildren = ng.bind(this, this.showChildren, scope);
    scope.hasChildren = ng.bind(this, this.hasChildren);
    scope.isItemSelected = ng.bind(this, this.isItemSelected);
    scope.isLevelSelected = ng.bind(this, this.isLevelSelected);
  };
  Finder.prototype.selectItemByValue = function (scope, value) {
    var item = this.getItemByValue(scope.source, value);
    if (item != null) {
      var selectedItems = this.getAllSelected(item);
      ng.forEach(selectedItems, function (item) {
        this.showChildren(scope, item);
      }, this);
    } else {
      if (this.expandList.length > 1) {
        this.expandList.splice(1, this.expandList.length - 1);
      }
      this.selectedItems = [];
    }
  };
  Finder.prototype.getItemByValue = function (source, value) {
    var result = null;
    ng.forEach(source, function (item) {
      if (item.value == value) {
        result = item;
      }
    });
    return result;
  };
  Finder.prototype.getExpandList = function (selectedItem) {
    this.selectedItems = this.getAllSelected(selectedItem);
    if (this.selectedItems.length <= 0) {
      this.expandList.push(this.dataSource[0]['/']);
    }
    return this.expandList;
  };
  Finder.prototype.isItemSelected = function (item, index) {
    if (this.selectedItems[index] == item) {
      return true;
    }
    return false;
  };
  Finder.prototype.isLevelSelected = function (level) {
    if (this.selectedItems.length - 1 == level) {
      return true;
    }
    return false;
  };
  Finder.prototype.showChildren = function (scope, item, evt) {
    var level = this.getLevel(item);
    var childLevel = level + 1;
    var children = this.getChildren(item);
    if (!ng.isUndefined(this.selectedItems[level])) {
      this.selectedItems.splice(level, this.selectedItems.length - level);
    }
    this.selectedItems[level] = item;
    scope.ngModel = this.selectedItems.slice(-1).pop().value;
    if (ng.isUndefined(evt)) {
      this.scrollToView(this.selectedItems.length - 1);
    } else {
      this.isClick = true;
    }
    if (this.expandList.length >= childLevel) {
      this.expandList.splice(childLevel, this.expandList.length - childLevel);
    }
    if (children != null) {
      this.expandList[childLevel] = this.getChildren(item);
    }
  };
  Finder.prototype.scrollToView = function (listIndex) {
    this.$timeout(function () {
      var ul = ng.element(this.elem.find('ul')[listIndex]);
      var li = ul.find('li.selected');
      var index = ul.find('li').index(li);
      ul.scrollTop(index * li.innerHeight() - ul.innerHeight() / 2);
    }.bind(this));
  };
  Finder.prototype.getChildren = function (item) {
    var childLevel = this.getLevel(item) + 1;
    var children = null;
    if (!ng.isUndefined(this.dataSource[childLevel])) {
      if (this.dataSource[childLevel].hasOwnProperty(this.getPath(item))) {
        children = this.dataSource[childLevel][this.getPath(item)];
      }
    }
    return children;
  };
  Finder.prototype.hasChildren = function (item) {
    return this.getChildren(item) == null ? false : true;
  };
  Finder.prototype.initData = function (dataSource) {
    var groupedData = [];
    ng.forEach(dataSource, function (item) {
      var level = this.getLevel(item);
      var parentPath = this.getParentPath(item);
      if (ng.isUndefined(groupedData[level])) {
        groupedData[level] = {};
      }
      if (ng.isUndefined(groupedData[level][parentPath])) {
        groupedData[level][parentPath] = [];
      }
      groupedData[level][parentPath].push(item);
    }, this);
    return groupedData;
  };
  Finder.prototype.getLevel = function (item) {
    var path = this.getPath(item, false);
    return path.split('/').length - 1;
  };
  Finder.prototype.getPath = function (item, startWithSlash) {
    var startWithSlash = ng.isUndefined(startWithSlash) ? true : startWithSlash;
    var path = item.path;
    if (path[path.length - 1] == '/') {
      path = path.substr(0, path.length - 1);
    }
    if (startWithSlash == false) {
      path = path.substr(1, path.length - 1);
    }
    return path;
  };
  Finder.prototype.getParent = function (item) {
    var parentPath = this.getParentPath(item);
    var parentItem = null;
    var level = this.getLevel(item);
    if (level > 0) {
      ng.forEach(this.dataSource[level - 1], function (items, path) {
        if (parentPath.indexOf(path) == 0) {
          ng.forEach(items, function (item) {
            if (this.getPath(item) == parentPath) {
              parentItem = item;
            }
          }, this);
        }
      }, this);
    }
    return parentItem;
  };
  Finder.prototype.getAllSelected = function (item) {
    var parents = ng.isUndefined(arguments[1]) ? [] : arguments[1];
    if (item == null) {
      return parents;
    } else {
      parents.unshift(item);
      return this.getAllSelected(this.getParent(item), parents);
    }
  };
  Finder.prototype.getParentPath = function (item, startWithSlash) {
    var startWithSlash = ng.isUndefined(startWithSlash) ? true : startWithSlash;
    var path = '';
    if (startWithSlash == true) {
      path = '/';
    }
    if (item === null) {
      return path;
    } else {
      var pathInfo = this.getPath(item, false).split('/');
      return path + pathInfo.slice(0, pathInfo.length - 1).join('/');
    }
  };
  ng.module('ntd.directives').directive('adminuiFinder', [
    '$timeout',
    FinderDirective
  ]);
}(angular));