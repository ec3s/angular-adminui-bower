angular.module('ntd.directives').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/adminui-frame.html',
    "<nav class=\"navbar navbar-inverse navbar-fixed-top\" role=navigation><div class=container-fluid><div class=navbar-header><button class=navbar-toggle type=button data-toggle=collapse data-target=.bs-navbar-collapse><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand href=\"../\"></a></div><div class=\"collapse navbar-collapse bs-navbar-collapse\"><ul class=\"nav navbar-nav main-nav\"><li data-ng-repeat=\"nav in navigation\" data-ng-class=\"{true: 'active', false: ''}[nav.children != null]\"><a data-ng-href={{nav.url}}>{{nav.name}}</a><ul class=sub-navbar data-ng-if=\"nav.children != null\"><li data-ng-repeat=\"subnav in nav.children\" data-ng-class=\"{true: 'active', false: ''}[isSelected(subnav)]\"><a data-ng-click=selectNav(subnav) data-ng-href={{subnav.url}}>{{subnav.name}}</a></li></ul></li></ul><ul class=\"nav navbar-nav navbar-right\"><li class=dropdown><a data-ng-show=isMessageBoxShow class=dropdown-toggle href=# data-toggle=dropdown><span class=badge data-ng-show=\"messages.length > 0\">{{messages.length}}</span> <i class=\"glyphicon glyphicon-inbox\"></i></a><ul data-ng-show=isMessageBoxShow class=dropdown-menu><li data-ng-repeat=\"message in messages\"><a href=#>{{message.title}}</a></li><li class=divider></li><li><a href=#><i class=\"glyphicon glyphicon-chevron-right pull-right\"></i> 查看全部</a></li></ul></li><li data-ng-class=\"{true: 'active', false: ''}[isSubMenuShow]\"><a href=javascript:; data-ng-click=toggleSubMenu($event)><i class=\"glyphicon glyphicon-list\"></i></a></li><li class=dropdown><a class=dropdown-toggle href=# data-toggle=dropdown>您好，{{userInfo.username}}<b class=caret></b></a><ul class=dropdown-menu><li class=user-information><img data-ng-src={{userInfo.avatar}} alt=user_avatar><div class=\"user-content muted\">{{userInfo.username}}</div></li><li class=divider></li><li><a data-ng-click=changePwd($event) href=#><i class=\"glyphicon glyphicon-lock\"></i> 修改密码</a></li><li><a data-ng-click=logout($event) href=#><i class=\"glyphicon glyphicon-off\"></i> 退出</a></li></ul></li></ul></div></div><nav class=sub-navbar-back></nav></nav><div class=container-fluid><div class=\"row fix-row\"><div class=\"col-md-2 container-fluid\" data-ng-show=hasSideMenu><div data-ng-show=isSubMenuShow class=row><div class=\"col-md-2 affix side-nav\"><h4>{{sideMenuName}}</h4><ul class=side-nav-menu><li data-ng-repeat=\"sidemenu in menu\" data-ng-class=\"{true: 'active', false: ''}[isSelected(sidemenu)]\"><a data-ng-href={{sidemenu.url}} data-ng-class=\"{true: 'has-sub-menu', false: ''}[sidemenu.children != null]\" data-ng-click=\"selectMenu(sidemenu, $event)\"><i class=\"pull-right glyphicon glyphicon-chevron-down\" data-ng-show=\"sidemenu.children != null\"></i>{{sidemenu.name}}</a><ul data-ng-if=\"sidemenu.children != null\"><li data-ng-repeat=\"subsidemenu in sidemenu.children\" data-ng-class=\"{true: 'active', false: ''}[isSelected(subsidemenu)]\"><a data-ng-click=\"selectMenu(subsidemenu, $event)\" data-ng-href={{subsidemenu.url}}>{{subsidemenu.name}}</a></li></ul></li></ul></div></div></div><div data-ng-class=\"{true: 'col-md-offset-2', false: ''}[isSubMenuShow && hasSideMenu]\" class=\"message-container flash-alert\"></div><div data-ng-class=\"{true: 'col-md-offset-2', false: ''}[isSubMenuShow && hasSideMenu]\" class=\"message-container notice\"></div><div data-ng-class=\"{true: 'col-md-10', false: 'col-md-12'}[isSubMenuShow && hasSideMenu]\" data-ng-transclude=\"\"></div></div></div>"
  );


  $templateCache.put('templates/checkbox-group.html',
    "<div class=\"dropdown dropdown-checkbox-group\"><label class=dropdown-toggle data-toggle=dropdown><input type=checkbox data-ng-click=toggleCheckedAll() data-ng-class=\"{'part': 'part-checked'}[status]\" data-ng-checked=\"{'all': true, 'part': true, 'none': false}[status]\">{{dataSource.name}} <b class=caret></b></label><ul class=dropdown-menu><li data-ng-repeat=\"checkbox in dataSource.checkboxGroup\"><label><input type=checkbox data-ng-model=checkbox.checked>{{checkbox.name}}</label></li><li data-ng-show=\"dataSource.checkboxGroup.length <= 0\"><label>无可选项目</label></li></ul></div>"
  );


  $templateCache.put('templates/finder.html',
    "<div class=adminui-finder-container><div class=adminui-finder-inner>{{selectedItems}}<ul data-ng-repeat=\"list in finderList\" style=\"margin-left: {{30 * $index}}%\" data-ng-class=\"{true: 'selected'}[isLevelSelected($index)]\"><li data-ng-click=\"showChildren(item, $event)\" data-ng-class=\"[{true: 'selected'}[isItemSelected(item, $parent.$index)], {true: 'has-child'}[hasChildren(item)]]\" data-ng-repeat=\"item in list\">{{item.text}}</li></ul></div></div>"
  );

}]);
