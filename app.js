var RegistrationView = Backbone.View.extend({
    initialize: function() {

        var view = this;
        this.render();
    },
    render: function() {
        console.log('hello')
        this.$el.html($('#blabla').html());
    },
    events: {
        'click .submitButton': function() {
            this.model.sortUsersBy('firstName');
        },
        'click .last-name-heading': function() {
            this.model.sortUsersBy('lastName');
        }
    },
    el: '#element'
});

var RegModel = Backbone.Model.extend({
    url: '/register'
});

var regModel = new RegModel();
var user = new RegistrationView({model: regModel});
