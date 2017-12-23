$(document).ready(function() {
    // init dropzone
    Dropzone.options.fileInput = {
        paramName: "file-input", // The name that will be used to transfer the file
        maxFilesize: 10, // MB

        init: function() {
            this.on("success", function(file, response) {
                $("#upload-results-panel").append(response);

                initUploadForm();
            });
        }
    };

    initUploadForm();
});


function initUploadForm() {
    // set up autocomplete fields
    performRequest(hostname + "/data?fetch=tags,people", "GET", "", function (result) {
        var tokenfieldSets = [["tags", "#tags-input", false], ["people", "#people-input", false]];
        var parsedData = JSON.parse(result);

        initMetaDataFields(parsedData, tokenfieldSets, null);
    });

    // set initial states
    setButtonProcessing($(".btn-primary, .btn-danger"), false);

    // for each panel, destroy old events and set up new events
    $(".upload-result-panel").each(function() {
        var panel = $(this);
        var fileName = panel.find(".img-details input[type=hidden]").val();

        panel.find("form").on("submit", function(e) {
            e.preventDefault();
            return false;
        });

        // perform publish file request
        panel.find("form .btn-primary").on("click", function(e) {
            e.preventDefault();
            setButtonProcessing($(this), true);

            // perform request
            performRequest(hostname + "/upload/store", "POST", $(".upload-result-container form").serialize(), function (result) {
                result = result.trim();

                setButtonProcessing(panel.find("form .btn-primary"), false);

                if (result === "success") {
                    panel.fadeOut(500, function () {
                        panel.remove();
                    });
                    setAlertWindow("success", "File '" + fileName + "' successfully published!", "#error-window");
                }
                else if (result === "no_tags") {
                    setAlertWindow("warning", "Please specify at least one tag for '" + fileName + "'.", "#error-window");
                }
                else if (result === "no_people") {
                    setAlertWindow("warning", "Please specify at least one person for '" + fileName + "'.", "#error-window");
                }
                else if (result === "already_stored") {
                    panel.fadeOut(500, function () {
                        panel.remove();
                    });
                    setAlertWindow("warning", "A copy of '" + fileName + "' has already been stored!", "#error-window");
                }
                else {
                    setAlertWindow("danger", "A server error occurred (" + fileName + ").", "#error-window");
                }
            });
        });

        // delete image from user's temp dir
        panel.find("form .btn-danger").on("click", function(e) {
            e.preventDefault();
            setButtonProcessing($(this), true);

            // perform request
            performRequest(hostname + "/upload/temp_delete", "POST", $(".upload-result-container form").serialize(), function (result) {
                result = result.trim();

                setButtonProcessing(panel.find("form .btn-danger"), false);

                if (result === "success") {
                    panel.fadeOut(500, function() {
                        panel.remove();
                    });
                    setAlertWindow("success", "File '" + fileName + "' deleted!", "#error-window");
                }
                else if (result === "invalid_file") {
                    panel.fadeOut(500, function() {
                        panel.remove();
                    });
                    setAlertWindow("success", "File '" + fileName + "' has already been deleted!", "#error-window");
                }
                else {
                    setAlertWindow("danger", "A server error occurred (" + fileName + ").", "#error-window");
                }
            });
        });
    });
}