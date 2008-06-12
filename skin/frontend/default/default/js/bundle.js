if(typeof Product=='undefined') {
    var Product = {};
}
/**************************** BUNDLE PRODUCT **************************/
Product.Bundle = Class.create();
Product.Bundle.prototype = {
    initialize: function(config){
        this.config = config;
    },
    changeSelection: function(selection){
        parts = selection.id.split('-');
        if (this.config['options'][parts[2]].isMulti) {
            selected = new Array();
            if (selection.tagName == 'SELECT') {
                for (var i = 0; i < selection.options.length; i++) {
                    if (selection.options[i].selected && selection.options[i].value != '') {
                        selected.push(selection.options[i].value);
                    }
                }
            } else if (selection.tagName == 'INPUT') {
                selections = $A(selection.parentNode.getElementsByTagName('INPUT'));
                for (var i = 0; i < selections.length; i++) {

                    if (selections[i].checked && selections[i].value != 'none') {
                        selected.push(selections[i].value);
                    }
                }
            }
            this.config.selected[parts[2]] = selected;
        } else {
            if (selection.value != '' && selection.value != 'none') {
                this.config.selected[parts[2]] = new Array(selection.value);
            } else {
                this.config.selected[parts[2]] = new Array();
            }
            this.populateQty(parts[2], selection.value);
        }
        this.reloadPrice();
    },

    reloadPrice: function() {
        if (this.config.priceType == '1') {
            var calculatedPrice = Number(this.config.basePrice);
        } else {
            var calculatedPrice = Number(0);
        }
        for (var option in this.config.selected) {
            if (this.config.options[option]) {
                for (var i=0; i < this.config.selected[option].length; i++) {
                    calculatedPrice += Number(this.selectionPrice(option, this.config.selected[option][i]));
                }
            }
        }

        if (this.config.specialPrice) {
            calculatedPrice = (calculatedPrice*this.config.specialPrice)/100;
        }

        $('bundle-price-' + this.config.bundleId).innerHTML = formatCurrency(calculatedPrice, this.config.priceFormat);

    },

    selectionPrice: function(optionId, selectionId) {
        if (selectionId == '' || selectionId == 'none') {
            return 0;
        }

        if (this.config.options[optionId].selections[selectionId].customQty == 1 && !this.config['options'][optionId].isMulti) {
            qty = $('bundle-option-' + optionId + '-qty-input').value;
        } else {
            qty = this.config.options[optionId].selections[selectionId].qty;
        }

        if (this.config.priceType == '0') {
            price = this.config.options[optionId].selections[selectionId].price;
            tierPrice = this.config.options[optionId].selections[selectionId].tierPrice;

            for (var i=0; i < tierPrice.length; i++) {
                if (Number(tierPrice[i].price_qty) <= qty && Number(tierPrice[i].price) <= price) {
                    price = tierPrice[i].price;
                }
            }
        } else {
            selection = this.config.options[optionId].selections[selectionId];
            if (selection.priceType == '0') {
                price = selection.priceValue;
            } else {
                price = (this.config.basePrice*selection.priceValue)/100;
            }
        }
        return price*qty;
    },

    populateQty: function(optionId, selectionId){
        if (selectionId == '' || selectionId == 'none') {
            this.showQtyLabel(optionId, '');
            return;
        }
        if (this.config.options[optionId].selections[selectionId].customQty == 1) {
            this.showQtyInput(optionId, this.config.options[optionId].selections[selectionId].qty);
        } else {
            this.showQtyLabel(optionId, this.config.options[optionId].selections[selectionId].qty);
        }
    },

    showQtyInput: function(optionId, value) {
        $('bundle-option-' + optionId + '-qty-input').value = value;
        $('bundle-option-' + optionId + '-qty-input').disabled = false;
        $('bundle-option-' + optionId + '-qty-input').show();
        $('bundle-option-' + optionId + '-qty-label').hide();
    },

    showQtyLabel: function(optionId, value) {
        $('bundle-option-' + optionId + '-qty-label').innerHTML = value;
        $('bundle-option-' + optionId + '-qty-input').disabled = false;
        $('bundle-option-' + optionId + '-qty-label').show();
        $('bundle-option-' + optionId + '-qty-input').hide();
    },

    changeOptionQty: function (element) {
        if (Number(element.value) == 0) {
            element.value = 1;
        }
        parts = element.id.split('-');
        optionId = parts[2];
        if (!this.config['options'][optionId].isMulti) {
            selectionId = this.config.selected[optionId][0];
            this.config.options[optionId].selections[selectionId].qty = element.value*1;
            this.reloadPrice();
        }
    },
}