/**
 * @description Model for Annotations used for AWS X-Ray
 */
export class Annotations {
  constructor(
    public application: string,
    public service: string,
  ) {}
}
