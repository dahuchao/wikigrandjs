'use strict';

//Pages service used to communicate Pages REST endpoints
angular.module('moduleWikiFormateur', [])
/**
 * Formateur des pages du wiki
 */
.factory('dcWikiFormateur', ['$sce',
    function formateur($sce) {
        // Formatting
        var boldPattern = new RegExp("\\*(.*?)\\*", "g");
        var boldReplacement = "<b>$1</b>";

        var italicsPattern = new RegExp("=(.*?)=", "g");
        var italicsReplacement = "<i>$1</i>";

        var underlinePattern = new RegExp("_(.*?)_", "g");
        var underlineReplacement = "<u>$1</u>";

        var heading1Pattern = new RegExp("^\\+{1}\s?([^\\+]*)");
        var heading1Replacement = "<h1>$1</h1>";

        var heading2Pattern = new RegExp("^\\+{2}\s?([^\\+]*)");
        var heading2Replacement = "<h2>$1</h2>";

        var heading3Pattern = new RegExp("^\\+{3}\s?([^\\+]*)");
        var heading3Replacement = "<h3>$1</h3>";

        var heading4Pattern = new RegExp("^\\+{4}\s?([^\\+]*)");
        var heading4Replacement = "<h4>$1</h4>";

        var heading5Pattern = new RegExp("^\\+{5}\s?([^\\+]*)");
        var heading5Replacement = "<h5>$1</h5>";

        var heading6Pattern = new RegExp("^\\+{6}\s?([^\\+]*)");
        var heading6Replacement = "<h6>$1</h6>";

        var liste1Pattern = new RegExp("^-{1}\s?([^\\+]*)");
        var liste1Replacement = "<h1>$1</h1>";

        /// Horizontal Rule
        var hrPattern = /^-{4}$/;
        var hrReplacement = "<hr />";

        // Anchors/Internal Links
        var anchorPattern = /\[a:(.*?)\]/;
        var anchorReplacement = "<a name=\"$1\"></a>";

        var goToPattern = new RegExp("\\[([-_'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ\\s\\w\\.]+)\\]", "g");
        var goToReplacement = "<a href=\"#pages/$1\">$1</a>";

        var goToPatternLabel = new RegExp("\\[\\[([-_'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ\\s\\w\\.]+)\\]\\[([-_'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ\\s\\w\\.]+)\\]\\]", "g");
        var goToReplacementLabel = "<a href=\"#pages/$1\">$2</a>";

        // External Links
        var urlPattern = new RegExp("\\[\\[http:\\/\\/(.*?)\\]\\[(.*?)\\]\\]");
        var urlReplacement = "<a href=\"$1\">$2</a>";
        var urlPatternLabel = new RegExp("\\[(http://)(.*?)\\]");
        var urlReplacementLabel = "<a href=\"$1$2\">$2</a>";

        var unorderedListDepth = 0;
        var orderedListDepth = 0;
        var profondeurHtml = 0;
        var retourLigne = true;

        function ParseWiki(inputData) {
            //console.log('Traitement de la ligne : ' + inputData);
            var output = "";
            var lines = inputData.split("\n");
            for (var i = 0; i < lines.length; i++) {
                retourLigne = true;
                lines[i] = ReplaceBold(lines[i]);
                lines[i] = ReplaceItalics(lines[i]);
                lines[i] = ReplaceUnderline(lines[i]);
                lines[i] = ReplaceHeading6(lines[i]);
                lines[i] = ReplaceHeading5(lines[i]);
                lines[i] = ReplaceHeading4(lines[i]);
                lines[i] = ReplaceHeading3(lines[i]);
                lines[i] = ReplaceHeading2(lines[i]);
                lines[i] = ReplaceHeading1(lines[i]);
                lines[i] = ReplaceHorizontalRule(lines[i]);
                //lines[i] = ReplaceLists(lines[i]);
                lines[i] = ReplaceListe(lines[i]);
                lines[i] = ReplaceBlankLines(lines[i]);
                lines[i] = ReplaceAnchor(lines[i]);
                lines[i] = ReplaceGoTo(lines[i]);
                lines[i] = ReplaceLink(lines[i]);
                lines[i] = ReplaceFile(lines[i]);
                lines[i] = AjoutRetourLigne(lines[i]);
                output += lines[i];
            }
            return $sce.trustAsHtml(output);
        }

        function AjoutRetourLigne(data) {
            var res = data;
            // Si la ligne demande un retour
            if (retourLigne) {
                // Insertion d'un retour à la ligne
                res = res + "<br/>";
            }
            return res;
        }

        function ReplaceListe(data) {
            var output = "";
            // On ne gère que 3 niveaux de liste
            var listePatron = new RegExp("^(-{1,3})\\s?(.*)");
            // Si la ligne traite d'une liste
            if (data.match(listePatron)) {
                // Calcul du préfix wiki marquant une liste "-"
                var marqueursNiveauWiki = data.replace(listePatron, "$1");
                // Calcul du niveau de la liste (ou du rang)
                var niveauWiki = marqueursNiveauWiki.length - 1;
                // Si la prof de la lst html est inf au niv de la lst wiki
                if (profondeurHtml < niveauWiki) {
                    // Augmentation de la profondeur
                    profondeurHtml += 1;
                    // Définition de la balise html de liste
                    var balLst = "<ul class=\"style\">";
                    // Ajout de la balise html de début de liste <ul>
                    output += balLst.replace("style", "styleLstNiv" + niveauWiki);
                }
                // Si la prof de la lst html est sup au niv de lst wiki
                while (profondeurHtml > niveauWiki) {
                    // Diminution de la profondeur
                    profondeurHtml -= 1;
                    // Ajout de la balise html de fin de liste
                    output += "</ul>";
                }
                // Si la prof de la lst html correspond au niv de la lst wiki
                if (profondeurHtml == niveauWiki) {
                    // Insertion de la balise item de liste
                    output += data.replace(listePatron, "<li>$2</li>");
                    // Le retour à la ligne a déjà été traité
                    retourLigne = false;
                }
            } else {
                // Le niveau de liste doit revenir à zéro
                niveauWiki = 0;
                // Si la prof de la lst html est sup au niv de lst wiki
                while (profondeurHtml > niveauWiki) {
                    // Diminution de la profondeur
                    profondeurHtml -= 1;
                    // Ajout de la balise html de fin de liste
                    output += "</ul>";
                    // Le retour à la ligne a déjà été traité
                    retourLigne = false;
                }
                // Reprise de la donnée brute
                output += data;
            }
            return output;
        }

        function ReplaceBold(data) {
            return data.replace(boldPattern, boldReplacement);
        }

        function ReplaceItalics(data) {
            return data.replace(italicsPattern, italicsReplacement);
        }

        function ReplaceUnderline(data) {
            return data.replace(underlinePattern, underlineReplacement);
        }

        function ReplaceHeading1(data) {
            var res = data;
            if (data.match(heading1Pattern)) {
                res = data.replace(heading1Pattern, heading1Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHeading2(data) {
            var res = data;
            if (data.match(heading2Pattern)) {
                res = data.replace(heading2Pattern, heading2Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHeading3(data) {
            var res = data;
            if (data.match(heading3Pattern)) {
                res = data.replace(heading3Pattern, heading3Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHeading4(data) {
            var res = data;
            if (data.match(heading4Pattern)) {
                res = data.replace(heading4Pattern, heading4Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHeading5(data) {
            var res = data;
            if (data.match(heading5Pattern)) {
                res = data.replace(heading5Pattern, heading5Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHeading6(data) {
            var res = data;
            if (data.match(heading6Pattern)) {
                res = data.replace(heading6Pattern, heading6Replacement);
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return res;
        }

        function ReplaceHorizontalRule(data) {
            return data.replace(hrPattern, hrReplacement);
        }

        function ReplaceAnchor(data) {
            return data.replace(anchorPattern, anchorReplacement);
        }

        function ReplaceGoTo(data) {
            var res = data.replace(goToPatternLabel, goToReplacementLabel);
            res = res.replace(goToPattern, goToReplacement);
            return res;
        }

        function ReplaceLink(data) {
            var res = data.replace(urlPattern, urlReplacement);
            res = res.replace(urlPatternLabel, urlReplacementLabel);
            return res;
        }

        function ReplaceFile(data) {
            var filePattern = new RegExp("doc:\\/\\/(.*)");
            var fileReplacement = "<a href=\"/docs/$1\" target=\"_blank\" >$1</a>";
            var res = data.replace(filePattern, fileReplacement);
            return res;
        }

        function ReplaceBlankLines(data) {
            if (data.length == 0) {
                data = "<br />";
                // Le retour à la ligne a déjà été traité
                retourLigne = false;
            }
            return data;
        }
        var formateur = ParseWiki;
        return formateur;
    }
]);