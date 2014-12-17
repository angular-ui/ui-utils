(function () {
    'use strict';

    angular.module('myApp', ['ui.uploader']).controller('myController', demoController);

    demoController.$inject = ['$log', 'uiUploader', '$scope'];

    function demoController($log, $uiUploader, $scope) {
        
        $scope.btn_remove = function(file){
            $log.info('deleting='+file);
            $uiUploader.removeFile(file);
        };
        
        $scope.btn_clean = function(){
            $uiUploader.removeAll();
        };

        $scope.btn_upload = function() {
            $log.info('uploading...');
            $uiUploader.startUpload({
                url: 'http://localhost:3000/welcome/ui_uploader',
                concurrency: 2,
                onProgress: function(file) {
                    $log.info(file.name+'='+file.humanSize);
                    //$log.info($scope.files.indexOf(file));
                    $scope.$apply();
                },
                onCompleted: function(file) {
                    $log.info(file);
                }
            });
        };
        
        $scope.files=[];

        var element = document.getElementById('file1');
        element.addEventListener('change', function(e) {
            var files = e.target.files;
            $uiUploader.addFiles(files);
            $scope.files = $uiUploader.getFiles();
            $scope.$apply();
            //            $log.info($uiUploader.files.length);
        });
    }
})();