// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.notifications')

/**
 * Notification action directive.
 *
 * @module mm.addons.notifications
 * @ngdoc directive
 * @name mmaNotificationsActions
 */
.directive('mmaNotificationsActions', function($log, $mmModuleActionsDelegate, $state) {
    $log = $log.getInstance('mmaNotificationsActions');

    // Directive link function.
    function link(scope, element, attrs) {
        if (scope.contexturl) {
            scope.actions = $mmModuleActionsDelegate.getActionsFor(scope.contexturl, scope.courseid);
        }
    }

    // Directive controller.
    function controller($scope) {
        $scope.jump = function(e, state, stateParams) {
            e.stopPropagation();
            e.preventDefault();
            $state.go(state, stateParams);
        };
    }

    return {
        controller: controller,
        link: link,
        restrict: 'E',
        scope: {
            contexturl: '=',
            courseid: '='
        },
        templateUrl: 'addons/notifications/templates/actions.html',
    };
});
