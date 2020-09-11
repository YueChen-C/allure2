import GraphLayout from './GraphLayout';

allure.api.addTab('performance', {
    title: 'tab.performance.name', icon: 'fa fa-area-chart',
    route: 'performance',
    onEnter: () => new GraphLayout()
});



