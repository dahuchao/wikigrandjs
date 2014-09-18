'use strict';

//Pages service used to communicate Pages REST endpoints
var moduleWikiResource = angular.module('moduleWikiResource', ['ngResource']);


moduleWikiResource.factory('dcWikiResource', ['$resource',
 function ($resource) {
        // Ressource des pages du wiki
        var Pages = $resource('/pages/:nom', {
            nom: '@nom'
        });
        return Pages;
      }]);