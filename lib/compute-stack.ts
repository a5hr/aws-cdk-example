import cdk = require('@aws-cdk/core');
import { AutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import ec2 = require('@aws-cdk/aws-ec2');
import { ApplicationLoadBalancer } from "@aws-cdk/aws-elasticloadbalancingv2";

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const asg = new AutoScalingGroup(this, 'ASG', {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      })
    });

    const alb = new ApplicationLoadBalancer(this, 'ALB', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      internetFacing: true
    });

    const listener = alb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [asg]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');
  }
}
