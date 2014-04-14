"use strict";
/*
 * Author: Remy Alain Ticona Carbajal http://realtica.org
 * Description: The main objective of ng-uploader is to have a user control,
 * clean, simple, customizable, and above all very easy to implement.
 * Licence: MIT
 */

angular.module('ui.ng-uploader', [])
    .directive('ngUploader', ['$log', function ($log) {
        return {
            restrict: 'AEC',
            templateUrl: function (element, attr) {
                return attr.templateUrl;
            },
            link: function ($scope, element, attrs) {
                $scope.fileList = [];
                $scope.concurrency = (typeof attrs.concurrency == "undefined") ? 2 : attrs.concurrency;
                $scope.concurrency = parseInt($scope.concurrency);
                $scope.parameter = (typeof attrs.name == "undefined") ? "file" : attrs.name;
                $scope.activeUploads = 0;
                $scope.getSize = function (bytes) {
                    var sizes = [ 'n/a', 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EiB', 'ZiB', 'YiB' ];
                    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
                    return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
                };
                //AngularJS not support input file bind yet.
                element.find("input").bind("change", function (e) {
                    var files = e.target.files;
                    for (var i = 0; i < files.length; i++) {
                        $scope.fileList.push({
                            parameter: $scope.parameter,
                            active: false,
                            filename: files[i].name,
                            file: files[i],
                            value: (0 / files[i].size) * 100,
                            size: 0,
                            total: $scope.getSize(files[i].size)
                        });
                    }
                    $scope.$apply();
                });

                $scope.erase = function (ele) {
                    $log.info("file erased=");
                    var position = $scope.fileList.indexOf(ele.file);
                    $scope.fileList.splice(position, 1);
                };
                $scope.onProgress = function (upload, loaded) {
                    $log.info("progress=" + loaded);
                    upload.value = (loaded / upload.file.size) * 100;
                    upload.size = $scope.getSize(loaded);
                    $scope.$apply();
                };

                $scope.onCompleted = function (upload) {
                    $log.info("file uploaded=" + upload.filename);
                    $scope.activeUploads -= 1;
                    $scope.fileList.splice($scope.fileList.indexOf(upload), 1);
                    $scope.$apply();
                    $scope.startUpload();
                };
                $scope.startUpload = function () {
                    $log.info("URL=" + attrs.ngUploader);
                    for (var i = 0; i < $scope.fileList.length; i++) {
                        if ($scope.activeUploads == $scope.concurrency) {
                            break;
                        }
                        if ($scope.fileList[i].active)
                            continue;
                        $scope.ajaxUpload($scope.fileList[i]);
                    }
                };

                $scope.ajaxUpload = function (upload) {

                    var xhr, formData, prop, data = "", key = "" || 'file';
                    console.log('Beging upload: ' + upload.filename);
                    $scope.activeUploads += 1;
                    upload.active = true;
                    xhr = new window.XMLHttpRequest();
                    formData = new window.FormData();
                    xhr.open('POST', attrs.ngUploader);

                    // Triggered when upload starts:
                    xhr.upload.onloadstart = function () {
                    };

                    // Triggered many times during upload:
                    xhr.upload.onprogress = function (event) {
                        if (!event.lengthComputable) {
                            return;
                        }
                        // Update file size because it might be bigger than reported by
                        // the fileSize:
                        $scope.onProgress(upload, event.loaded);
                    };

                    // Triggered when upload is completed:
                    xhr.onload = function () {
                        $scope.onCompleted(upload);
                    };

                    // Triggered when upload fails:
                    xhr.onerror = function () {
                    };

                    // Append additional data if provided:
                    if (data) {
                        for (prop in data) {
                            if (data.hasOwnProperty(prop)) {
                                formData.append(prop, data[prop]);
                            }
                        }
                    }

                    // Append file data:
                    formData.append(key, upload.file, upload.parameter);

                    // Initiate upload:
                    xhr.send(formData);

                    return xhr;
                };

            }
        };
    }]
    );