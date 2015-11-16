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

angular.module('mm.addons.mod_resource')

/**
 * Resource index controller.
 *
 * @module mm.addons.mod_resource
 * @ngdoc controller
 * @name mmaModResourceIndexCtrl
 */
.controller('mmaModResourceIndexCtrl', function($scope, $stateParams, $mmUtil, $mmaModResource, $log, $mmApp, $mmCourse,
            mmaModResourceComponent) {
    $log = $log.getInstance('mmaModResourceIndexCtrl');

    var module = $stateParams.module || {},
        courseid = $stateParams.courseid;

    $scope.title = module.name;
    $scope.description = module.description;
    $scope.component = mmaModResourceComponent;
    $scope.componentId = module.id;
    $scope.externalUrl = module.url;
    $scope.mode = false;
    $scope.loaded = false;

    function fetchContent() {
        if (module.contents) {
            if ($mmaModResource.isDisplayedInIframe(module)) {
                $scope.mode = 'iframe';
                var downloadFailed = false;
                return $mmaModResource.downloadAllContent(module).catch(function(err) {
                    // Mark download as failed but go on since the main files could have been downloaded.
                    downloadFailed = true;
                }).finally(function() {
                    $mmaModResource.getIframeSrc(module).then(function(src) {
                        $scope.src = src;
                        $mmaModResource.logView(module.instance).then(function() {
                            $mmCourse.checkModuleCompletion(courseid, module.completionstatus);
                        });
                        if (downloadFailed && $mmApp.isOnline()) {
                            // We could load the main file but the download failed. Show error message.
                            $mmUtil.showErrorModal('mm.core.errordownloadingsomefiles', true);
                        }
                    }).catch(function() {
                        $mmUtil.showErrorModal('mma.mod_resource.errorwhileloadingthecontent', true);
                    }).finally(function() {
                        $scope.loaded = true;
                    });
                });
            } else if ($mmaModResource.isDisplayedInline(module)) {
                var downloadFailed = false;
                $mmaModResource.downloadAllContent(module).catch(function(err) {
                    // Mark download as failed but go on since the main files could have been downloaded.
                    downloadFailed = true;
                }).finally(function() {
                    $mmaModResource.getResourceHtml(module.contents, module.id).then(function(content) {
                        $scope.mode = 'inline';
                        $scope.content = content;
                        $mmaModResource.logView(module.instance).then(function() {
                            $mmCourse.checkModuleCompletion(courseid, module.completionstatus);
                        });

                        if (downloadFailed && $mmApp.isOnline()) {
                            // We could load the main file but the download failed. Show error message.
                            $mmUtil.showErrorModal('mm.core.errordownloadingsomefiles', true);
                        }
                    }).catch(function() {
                        $mmUtil.showErrorModal('mma.mod_resource.errorwhileloadingthecontent', true);
                    }).finally(function() {
                        $scope.loaded = true;
                    });
                });
            } else {
                $scope.loaded = true;
                $scope.mode = 'external';

                $scope.open = function() {
                    var modal = $mmUtil.showModalLoading('mm.core.downloading', true);

                    $mmaModResource.openFile(module.contents, module.id).then(function() {
                        $mmaModResource.logView(module.instance).then(function() {
                            $mmCourse.checkModuleCompletion(courseid, module.completionstatus);
                        });
                    }).catch(function(error) {
                        if (error) {
                            $mmUtil.showErrorModal(error);
                        } else {
                            $mmUtil.showErrorModal('mma.mod_resource.errorwhileloadingthecontent', true);
                        }
                    }).finally(function() {
                        modal.dismiss();
                    });
                };
            }
        } else {
            $mmUtil.showErrorModal('mma.mod_resource.errorwhileloadingthecontent', true);
        }
    }

    // Event sent by the directive mmaModResourceHtmlLink when we click an HTML link.
    $scope.$on('mmaModResourceHtmlLinkClicked', function(e, target) {
        $scope.loaded = false;
        $mmaModResource.getResourceHtml(module.contents, module.id, target).then(function(content) {
            $scope.content = content;
        }).catch(function() {
            $mmUtil.showErrorModal('mma.mod_resource.errorwhileloadingthecontent', true);
        }).finally(function() {
            $scope.loaded = true;
        });
    });

    $scope.doRefresh = function() {
        $mmaModResource.invalidateContent(module.id).then(function() {
            return fetchContent();
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    fetchContent();
});
