'use strict';

//Pages service used to communicate Pages REST endpoints
var moduleWikiApp = angular.module('dcWikiApp', ['ngRoute', 'moduleWikiResource', 'moduleWikiFormateur']);

// Configuration des routes de l'application
moduleWikiApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'pages/page.html',
        controller: 'dcPageController'
    }).when('/pages', {
        templateUrl: 'pages/page.html',
        controller: 'dcPageController'
    }).when('/pages/:page', {
        templateUrl: 'pages/page.html',
        controller: 'dcPageController'
    });
    $locationProvider.html5Mode(false);
});

// Création du controleur du wiki
moduleWikiApp.controller('dcWikiController', ['$scope', '$routeParams', 'dcWikiResource',
    function ($scope, $routeParams, dcWikiResource) {
        var jetonFictif = "qsdfqsfqs23sfs";
        $scope.edition = false;
        $scope.onEdition = function () {
            // Si la page a été éditée
            if ($scope.edition === true) {
                // Diffusion de l'évènement aux scopes enfants
                $scope.$broadcast('onEnregistrement');
            }
            // Permutation du mode édition en mode lecture ou inversement
            $scope.edition = !$scope.edition;
        };
        $scope.connecter = function () {
            $scope.jeton = jetonFictif;
        }
        $scope.deconnecter = function () {
            $scope.jeton = null;
        }
    }]);

// Controleur des pages de wiki
moduleWikiApp.controller('dcPageController', ['$scope', '$routeParams', 'dcWikiResource', 'dcWikiFormateur',
    function ($scope, $routeParams, dcWikiResource, dcWikiFormateur) {
        // Calcul du nom de la page
        var nomPage = encodeURI($routeParams.page);
        // Si le nom de la page n'est pas définie
        if (nomPage.match("undefined")) {
            // Nom de la page par défaut
            nomPage = 'homepage';
        }
        // Journalisation
        console.log('* Lecture de la page de wiki : ' + nomPage);
        // Calcul de la page correspondant au nom
        var page = dcWikiResource.get({
            nom: nomPage
        }, function () {
            // Journalisation
            console.log('* >SReception de la page.');
            // Enregistrement du contenu de la page de wiki
            $scope.pagecontenu = page.contenu;
            // Enregistrement du contenu de la page de wiki
            $scope.pagehtml = dcWikiFormateur(page.contenu);
            // Lecture de la date de mise à jour
            $scope.dateMaj = page.dateMaj;
        });
        // Mise à l'écoute de l'évènement d'enregistrement de la page de wiki
        $scope.$on('onEnregistrement', function () {
            // Calcul du nom de la page
            var nomPage = encodeURI($routeParams.page);
            // Si le nom de la page n'est pas définie
            if (nomPage.match("undefined")) {
                // Nom de la page par défaut
                nomPage = 'homepage';
            }
            console.log('* Enregistrement de la page de wiki : ' + nomPage + '.');
            // Chargement de la page
            var page = dcWikiResource.get({
                nom: nomPage
            }, function () {
                // Journalisation
                console.log('* Relecture de la page avant enregistrement.');
                // Modification du contenu de la page de wiki
                page.contenu = $scope.pagecontenu;
                // Enregistrement des modifications
                page.$save();
                console.log('* Enregistré.');
                // Calcul du code html de la page de wiki
                $scope.pagehtml = dcWikiFormateur($scope.pagecontenu);
                // Lecture de la date de mise à jour
                $scope.dateMaj = page.dateMaj;
            });
        });
    }]);