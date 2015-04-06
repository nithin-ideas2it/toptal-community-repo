A.app({
  appName: "Toptal Community",
  onlyAuthenticated: true,
  allowSignUp: true,
  appIcon: "rocket",
  menuItems: [{
    name: "Events",
    entityTypeId: "Event",
    icon: "calendar"
  }, {
    name: "My Events",
    entityTypeId: "MyEvent",
    icon: "calendar"
  }],
  entities: function(Fields) {
    return {
      Event: {
        title: "Events",
        fields: {
          eventName: Fields.text("Event").required(),
          date: Fields.date("Date").required(),
          time: Fields.text("Starts at").masked("99:99").required(),
          appliedUsers: Fields.relation("Applied users", "AppliedUser", "event")
        },
        referenceName: "eventName",
        sorting: [['date', -1], ['time', -1]],
        actions: [{
          id: "apply",
          name: "Apply",
          actionTarget: 'single-item',
          perform: function (User, Actions, Crud) {
            return Crud.actionContextCrud().readEntity(Actions.selectedEntityId()).then(function (eventToApply) {
              var userEventCrud = Crud.crudForEntityType('UserEvent');
              return userEventCrud.find({filtering: {"user": User.id, "event": eventToApply.id}}).then(function (events) {
                if (events.length) {
                  return Actions.modalResult("Can't apply to event", "You've already applied to this event");
                } else {
                  return userEventCrud.createEntity({
                    user: {id: User.id},
                    event: {id: eventToApply.id},
                    date: eventToApply.date,
                    time: eventToApply.time
                  }).then(function () { return Actions.navigateToEntityTypeResult("MyEvent") });
                }
              });
            })
          }
        }]
      },
      UserEvent: {
        fields: {
          user: Fields.fixedReference("User", "OnlyNameUser").required(),
          event: Fields.fixedReference("Event", "Event").required(),
          date: Fields.date("Date").required(),
          time: Fields.text("Starts at").masked("99:99").required()
        },
        filtering: function (User) { return {"user.id": User.id} },
        sorting: [['date', -1], ['time', -1]],
        views: {
          MyEvent: {
            title: "My Events",
            showInGrid: ['event', 'date', 'time'],
            permissions: {
              write: [],
              delete: null
            }
          },
          AppliedUser: {
            permissions: {
	          write: []
            },
            showInGrid: ['user']
          }
        }
      },
      User: {
        views: {
          OnlyNameUser: {
            permissions: {
              read: null,
              write: ['admin']
            }
          },
          fields: {
            username: Fields.text("User name")
          }
        }
      }
    }
  }
});
