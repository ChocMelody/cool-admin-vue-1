import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		order: 10,
		components: [() => import('./components/IoTScene.vue')],
		views: [
			{
				path: '/iot/monitor',
				meta: {
					label: '产线监控'
				},
				component: () => import('./views/monitor/index.vue')
			}
		]
	};
};
