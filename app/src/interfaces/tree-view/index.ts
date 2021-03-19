import { defineInterface } from '../define';
import InterfaceTreeView from './tree-view.vue';

export default defineInterface(({ i18n }) => ({
	id: 'tree-view',
	name: i18n.t('tree_view'),
	icon: 'account_tree',
	types: ['alias'],
	groups: ['o2m'],
	relational: true,
	component: InterfaceTreeView,
	options: [],
}));
