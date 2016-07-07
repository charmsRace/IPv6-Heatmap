angular
    .module('iphm.controllers', [])
    .controller('TodoCtrl', TodoCtrl);

TodoCtrl.$inject = ['$rootScope', '$scope', 'todosFactory'];

function TodoCtrl($rootScope, $scope, todosFactory) {
    console.log('WHAAA');
    $scope.todos = [];
    $scope.isEditable = [];
    
    todosFactory.getTodos().then(function(data) {
        $scope.todos = data.data;
    });
    
    $scope.save = function($event) {
        if ($event.which == 13 && $scope.todoInput) {
            todosFactory.saveTodo({
                "todo": $scope.todoInput,
                "isCompleted": false
            }).then(function(data) {
                $scope.todos.push(data.data);
            });
            $scope.todoInput = '';
        }
    };
    
    $scope.updateStatus = function($event, _id, i) {
        var cbk = $event.target.checked;
        var _t = $scope.todos[i];
        todosFactory.updateTodo({
            _id: id,
            isCompleted: cbk,
            todo: _t.todo
        }).then(function(data) {
            if (data.data.updatedExisting) {
                _t.isCompleted = cbk;
            } else {
                alert('Oops!');
            }
        });
    };
    
    $scope.edit = function($event, i) {
        if ($event.which == 13 && $event.target.value.trim()) {
            var _t = $scope.todos[i];
            todosFactory.updateTodo({
                _id: _t._id,
                todo: $event.target.value.trim(),
                isCompleted: _t.isCompleted
            }).then(function(data) {
                if (data.data.updatedExisting) {
                    _t.todo = $event.target.value.trim();
                    $scope.isEditable[i] = false;
                } else {
                    alert('Oops!');
                }
            });
        }
    };
    
    $scope.delete = function(i) {
        todosFactory.deleteTodo($scope.todos[i]._id).then(function(data) {
            if (data.data) {
                $scope.todos.splice(i, 1);
            }
        });
    };
}
