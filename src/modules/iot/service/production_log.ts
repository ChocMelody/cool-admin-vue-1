import { BaseService } from '/@/cool/service';

class ProductionLog extends BaseService {
	constructor() {
		super('iot/production_log');
	}
}

export default ProductionLog;
