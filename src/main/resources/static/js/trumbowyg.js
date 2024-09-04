
// MathJax inline configuration
MathJax.Hub.Config({
    tex2jax: {
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
        ]
    }
});

$(document).ready(function () {
    trumbowygCall();
});

function trumbowygCall () {

    $('textarea')
        .trumbowyg({
            svgPath: '/dist/ui/icons.svg',
            changeActiveDropdownIcon: true,
            removeformatPasted: true,
            autogrow: true,
            autogrowOnEnter: true,
            imageWidthModalEdit: true,
            urlProtocol: true,
            tagClasses: {
                // Bootstrap example
                h1: 'h1',
                table: 'table table-border',
            },
            btnsDef: {
                // Create a new dropdown
                image: {
                    dropdown: ['base64', 'insertImage', 'noembed'],
                    ico: 'insertImage'
                },
                align: {
                    dropdown: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                    ico: 'justifyCenter'
                },
                list: {
                    dropdown: ['unorderedList', 'orderedList'],
                    ico: 'orderedList'
                },
            },
            btns: [
                ['viewHTML'],
                ['preformatted'],
                ['historyUndo', 'historyRedo'],
                ['formatting'],
                ['fontfamily'], ['fontsize'],
                ['strong', 'em', 'del'],
                ['superscript', 'subscript'],
                ['emoji'],
                ['mathml'],
                ['specialChars'],
                ['link'],
                ['image'],
                ['table', 'tableCellBackgroundColor', 'tableBorderColor'],
                ['foreColor', 'backColor'],
                ['list'],
                ['align'],
                ['indent', 'outdent'],
                ['lineheight'],
                ['horizontalRule'],
                ['removeformat'],
                ['ruby'],
                ['customButton'],
                ['fullscreen']
            ],
            plugins: {
                allowTagsFromPaste: {
                    allowedTags: ['h4', 'p', 'br']
                },
                resizimg: {
                    minSize: 64,
                    step: 16,
                }
            }
        });

}
function generatePdf () {

    const htmlContent = document.getElementById("description").value;

    // Create a new window to display the HTML content
    const newWindow = window.open('', '_blank');
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    // Wait for the content to load
    newWindow.onload = function () {
        // Use the browser's print functionality to save as PDF
        newWindow.print();
        newWindow.close();
    };
}

// document.getElementById("generate-pdf").addEventListener("click", () => generatePdf());

$("#btnGeneratePdf").on('click', function () {
    generatePdf();
});


// Define your custom Trumbowyg plugin
$.trumbowyg.plugins.myCustomButton = {
    init: function (trumbowyg) {
        // Add a custom button to the toolbar
        trumbowyg.addBtnDef('myCustomButton', {
            text: 'Custom Button', // Button text
            ico: 'justifyRight',   // Font Awesome icon for the button
            fn: function () {
                // Your custom function here
                trumbowyg.execCmd('insertText', 'This is my custom text.');
            }
        });
    }
};